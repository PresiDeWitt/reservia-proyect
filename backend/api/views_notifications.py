from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Notification


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_notifications(request):
    notifs = Notification.objects.filter(user=request.user)[:50]
    data = [
        {
            'id': n.id,
            'type': n.type,
            'title': n.title,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat(),
            'reservation_id': n.reservation_id,
        }
        for n in notifs
    ]
    return Response({'notifications': data})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_read(request, notification_id):
    updated = Notification.objects.filter(
        id=notification_id, user=request.user
    ).update(is_read=True)
    if not updated:
        return Response({'error': 'Not found'}, status=404)
    return Response({'status': 'ok'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'status': 'ok'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'count': count})
