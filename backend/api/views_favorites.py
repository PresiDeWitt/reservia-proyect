from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Favorite, Restaurant
from .serializers import RestaurantListSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_favorites(request):
    favs = Favorite.objects.filter(user=request.user).select_related('restaurant')
    restaurants = [f.restaurant for f in favs]
    data = RestaurantListSerializer(restaurants, many=True).data
    return Response({'favorites': data})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_favorite(request):
    restaurant_id = request.data.get('restaurantId')
    if not restaurant_id:
        return Response({'error': 'restaurantId required'}, status=400)
    restaurant = Restaurant.objects.filter(id=restaurant_id).first()
    if not restaurant:
        return Response({'error': 'Restaurant not found'}, status=404)
    _, created = Favorite.objects.get_or_create(user=request.user, restaurant=restaurant)
    if not created:
        return Response({'error': 'Already in favorites'}, status=400)
    return Response({'status': 'added'}, status=201)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_favorite(request, restaurant_id):
    deleted, _ = Favorite.objects.filter(
        user=request.user, restaurant_id=restaurant_id
    ).delete()
    if not deleted:
        return Response({'error': 'Not in favorites'}, status=404)
    return Response({'status': 'removed'})
