from datetime import date as date_type
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Restaurant, Review, Reservation
from .serializers import ReviewSerializer

REVIEWABLE_RESERVATION_STATUSES = ['confirmed', 'arrived']


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
            if not has_reviewed:
                can_review = Reservation.objects.filter(
                    user=request.user,
                    restaurant=restaurant,
                    status__in=REVIEWABLE_RESERVATION_STATUSES,
                    date__lt=date_type.today(),
                ).exists()

        return Response({
            'reviews': serializer.data,
            'can_review': can_review,
            'has_reviewed': has_reviewed,
        })

    # POST — create review
    if Review.objects.filter(user=request.user, restaurant=restaurant).exists():
        return Response({'error': 'Already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

    has_past_reservation = Reservation.objects.filter(
        user=request.user,
        restaurant=restaurant,
        status__in=REVIEWABLE_RESERVATION_STATUSES,
        date__lt=date_type.today(),
    ).exists()
    if not has_past_reservation:
        return Response(
            {'error': 'Must have a past confirmed reservation to review'},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = ReviewSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    # The Review post_save signal will automatically recalculate restaurant rating/reviews count
    review = serializer.save(user=request.user, restaurant=restaurant)

    return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
