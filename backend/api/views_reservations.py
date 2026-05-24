from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Reservation, AvailabilitySlot
from .serializers import ReservationSerializer


class ReservationCreateView(generics.CreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from datetime import datetime
        from rest_framework.exceptions import ValidationError as DRFValidationError
        restaurant = serializer.validated_data['restaurant']
        res_date = serializer.validated_data['date']
        res_time = serializer.validated_data['time']
        guests = serializer.validated_data['guests']

        reservation_dt = datetime.combine(res_date, res_time)
        if reservation_dt <= datetime.now():
            raise DRFValidationError({'detail': 'No puedes reservar una hora que ya ha pasado.'})

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
            from rest_framework.exceptions import ValidationError
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
    try:
        reservation = Reservation.objects.select_related('assigned_table').get(pk=pk, user=request.user)
    except Reservation.DoesNotExist:
        return Response(
            {"error": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND
        )
    reservation.status = "cancelled"
    reservation.save()
    if reservation.assigned_table:
        AvailabilitySlot.objects.filter(
            table=reservation.assigned_table,
            date=reservation.date,
            time=reservation.time,
        ).update(is_available=True)
    return Response({"message": "Reservation cancelled"})
