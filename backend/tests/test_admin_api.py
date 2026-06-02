from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .factories import create_restaurant, create_user


class AdminApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.restaurant = create_restaurant(name="Sakura")

    def _admin_token(self):
        staff_user = create_user(email='staff-admin@example.com', first_name='Staff', last_name='Admin')
        refresh = RefreshToken.for_user(staff_user)
        refresh['staff_role'] = 'admin'
        return str(refresh.access_token)

    def _normal_user_token(self):
        user = create_user(email='normal@example.com')
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_impersonation_blocked_without_token(self):
        response = self.client.post(
            '/api/admin/impersonate/',
            {'restaurant_id': self.restaurant.id},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_impersonation_blocked_for_normal_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self._normal_user_token()}')
        response = self.client.post(
            '/api/admin/impersonate/',
            {'restaurant_id': self.restaurant.id},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_impersonation_success_for_admin_generates_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self._admin_token()}')
        
        # Verify no owner assigned initially
        self.assertNil = self.restaurant.owner is None
        
        response = self.client.post(
            '/api/admin/impersonate/',
            {'restaurant_id': self.restaurant.id},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['role'], 'owner')
        
        # Refresh and verify owner was dynamically created and assigned
        self.restaurant.refresh_from_db()
        self.assertIsNotNone(self.restaurant.owner)
        self.assertEqual(self.restaurant.owner.email, f"owner_{self.restaurant.id}@reservia.demo")

    def test_impersonation_returns_existing_owner_token(self):
        owner = create_user(email='existing_owner@example.com')
        self.restaurant.owner = owner
        self.restaurant.save()

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self._admin_token()}')
        response = self.client.post(
            '/api/admin/impersonate/',
            {'restaurant_id': self.restaurant.id},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['role'], 'owner')
        
        # Verify owner has not changed
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.owner, owner)

    def test_impersonation_404_for_nonexistent_restaurant(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self._admin_token()}')
        response = self.client.post(
            '/api/admin/impersonate/',
            {'restaurant_id': 9999},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
