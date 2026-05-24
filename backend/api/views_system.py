from datetime import datetime, timezone as dt_timezone
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Restaurant


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health_check(request):
    try:
        Restaurant.objects.exists()
        db_status = "connected"
    except Exception:
        db_status = "error"

    return Response({
        "status": "ok",
        "database": db_status,
        "timestamp": datetime.now(dt_timezone.utc).isoformat(),
    })
