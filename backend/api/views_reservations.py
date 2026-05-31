from datetime import datetime
import logging

logger = logging.getLogger(__name__)

from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Reservation, AvailabilitySlot
from .serializers import ReservationSerializer


class ReservationCreateView(generics.CreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        restaurant = serializer.validated_data['restaurant']
        res_date = serializer.validated_data['date']
        res_time = serializer.validated_data['time']
        guests = serializer.validated_data['guests']

        # Comparación consciente de zona horaria (USE_TZ=True): el servidor corre
        # en UTC pero el negocio opera en TIME_ZONE. Construir un datetime naive
        # con datetime.now() comparaba relojes distintos y dejaba reservar slots ya pasados.
        reservation_dt = timezone.make_aware(datetime.combine(res_date, res_time))
        if reservation_dt <= timezone.localtime():
            raise ValidationError({'detail': 'No puedes reservar una hora que ya ha pasado.'})

        # transaction.atomic es obligatorio: sin él, select_for_update() es un no-op
        # en SQLite (race condition → doble reserva) y lanza TransactionManagementError
        # en PostgreSQL. El bloqueo de fila garantiza que dos peticiones concurrentes
        # no asignen el mismo slot.
        with transaction.atomic():
            slot = (
                AvailabilitySlot.objects
                .select_for_update()
                .filter(
                    is_available=True,
                    date=res_date,
                    time=res_time,
                    table__restaurant=restaurant,
                    table__is_active=True,
                    table__capacity__gte=guests,
                )
                .select_related('table')
                .order_by('table__capacity')
                .first()
            )
            if slot is None:
                raise ValidationError({'detail': 'No hay mesas disponibles para esa fecha, hora y número de comensales.'})

            slot.is_available = False
            slot.save(update_fields=['is_available'])
            serializer.save(user=self.request.user, assigned_table=slot.table)



@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def my_reservations(request):
    reservations = Reservation.objects.filter(user=request.user).select_related(
        "restaurant"
    )
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def cancel_reservation(request, pk):
    with transaction.atomic():
        try:
            reservation = (
                Reservation.objects
                .select_for_update()
                .select_related('assigned_table')
                .get(pk=pk, user=request.user)
            )
        except Reservation.DoesNotExist:
            return Response(
                {"error": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND
            )
        if reservation.status == "cancelled":
            return Response({"message": "Reservation cancelled"})
        reservation.status = "cancelled"
        reservation.save(update_fields=["status"])
        if reservation.assigned_table:
            AvailabilitySlot.objects.filter(
                table=reservation.assigned_table,
                date=reservation.date,
                time=reservation.time,
            ).update(is_available=True)
    return Response({"message": "Reservation cancelled"})


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def edit_reservation(request, pk):
    """Edita fecha, hora, guests, occasion y note de una reserva confirmada.

    Si cambia fecha/hora/guests: libera el slot antiguo y busca uno nuevo.
    Si solo cambia occasion/note: actualiza sin tocar slots.
    """
    try:
        reservation = (
            Reservation.objects
            .select_related('assigned_table', 'restaurant')
            .get(pk=pk, user=request.user)
        )
    except Reservation.DoesNotExist:
        return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)

    if reservation.status != 'confirmed':
        return Response(
            {'error': 'Solo se pueden editar reservas confirmadas.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    new_date   = request.data.get('date',     str(reservation.date))
    new_time   = request.data.get('time',     str(reservation.time))
    new_guests = int(request.data.get('guests', reservation.guests))
    new_occasion = request.data.get('occasion', reservation.occasion)
    new_note     = request.data.get('note',     reservation.note)

    # Parsear fecha y hora
    try:
        from datetime import date as date_type, time as time_type
        parsed_date = date_type.fromisoformat(new_date)
        parsed_time = time_type.fromisoformat(new_time[:5])  # acepta HH:MM o HH:MM:SS
    except ValueError as exc:
        return Response({'error': f'Formato de fecha/hora inválido: {exc}'}, status=status.HTTP_400_BAD_REQUEST)

    if not (1 <= new_guests <= 20):
        return Response({'error': 'El número de comensales debe estar entre 1 y 20.'}, status=status.HTTP_400_BAD_REQUEST)

    reservation_dt = timezone.make_aware(datetime.combine(parsed_date, parsed_time))
    if reservation_dt <= timezone.localtime():
        return Response({'error': 'No puedes reservar una hora que ya ha pasado.'}, status=status.HTTP_400_BAD_REQUEST)

    slot_changed = (
        parsed_date  != reservation.date or
        parsed_time  != reservation.time or
        new_guests   != reservation.guests
    )

    if slot_changed:
        with transaction.atomic():
            # Liberar slot actual
            if reservation.assigned_table:
                AvailabilitySlot.objects.filter(
                    table=reservation.assigned_table,
                    date=reservation.date,
                    time=reservation.time,
                ).update(is_available=True)

            # Buscar nuevo slot disponible
            new_slot = (
                AvailabilitySlot.objects
                .select_for_update()
                .filter(
                    is_available=True,
                    date=parsed_date,
                    time=parsed_time,
                    table__restaurant=reservation.restaurant,
                    table__is_active=True,
                    table__capacity__gte=new_guests,
                )
                .select_related('table')
                .order_by('table__capacity')
                .first()
            )
            if new_slot is None:
                # Revertir liberación del slot anterior
                if reservation.assigned_table:
                    AvailabilitySlot.objects.filter(
                        table=reservation.assigned_table,
                        date=reservation.date,
                        time=reservation.time,
                    ).update(is_available=False)
                return Response(
                    {'error': 'No hay mesas disponibles para esa fecha, hora y número de comensales.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            new_slot.is_available = False
            new_slot.save(update_fields=['is_available'])

            reservation.date           = parsed_date
            reservation.time           = parsed_time
            reservation.guests         = new_guests
            reservation.occasion       = new_occasion
            reservation.note           = new_note
            reservation.assigned_table = new_slot.table
            reservation.save(update_fields=['date', 'time', 'guests', 'occasion', 'note', 'assigned_table'])
    else:
        # Solo occasion / note — sin tocar slots
        reservation.occasion = new_occasion
        reservation.note     = new_note
        reservation.save(update_fields=['occasion', 'note'])

    from .serializers import ReservationSerializer
    return Response(ReservationSerializer(reservation).data)
