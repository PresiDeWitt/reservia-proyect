from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Restaurant, Review
from .serializers import ReviewSerializer


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def restaurant_reviews(request, pk):
    restaurant = get_object_or_404(Restaurant, pk=pk)

    if request.method == 'GET':
        reviews = restaurant.reviews.select_related('user').all()
        serializer = ReviewSerializer(reviews, many=True)

        can_review = False
        has_reviewed = False
        if request.user.is_authenticated:
            has_reviewed = Review.objects.filter(user=request.user, restaurant=restaurant).exists()
            can_review = not has_reviewed

        return Response({
            'reviews': serializer.data,
            'can_review': can_review,
            'has_reviewed': has_reviewed,
        })

    # POST — create review
    if Review.objects.filter(user=request.user, restaurant=restaurant).exists():
        return Response({'error': 'Already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = ReviewSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    # The Review post_save signal will automatically recalculate restaurant rating/reviews count
    review = serializer.save(user=request.user, restaurant=restaurant)

    return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
