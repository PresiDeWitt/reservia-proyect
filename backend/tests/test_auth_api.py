from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from tests.factories import create_user


class AuthApiTests(APITestCase):
    def test_register_creates_tokens_and_user_payload(self):
        response = self.client.post(
            reverse('register'),
            {
                'first_name': 'Ana',
                'last_name': 'Soto',
                'email': 'ana@example.com',
                'password': 'secret123',
                'phone': '+34123456789',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'ana@example.com')

    def test_register_rejects_duplicate_email(self):
        create_user(email='duplicate@example.com')

        response = self.client.post(
            reverse('register'),
            {
                'first_name': 'Dupe',
                'last_name': 'Case',
                'email': 'duplicate@example.com',
                'password': 'secret123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_rejects_short_password(self):
        response = self.client.post(
            reverse('register'),
            {
                'first_name': 'Short',
                'last_name': 'Pwd',
                'email': 'short@example.com',
                'password': '12345',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_login_returns_jwt_tokens_for_valid_credentials(self):
        user = create_user(email='login@example.com', first_name='Login')
        response = self.client.post(
            reverse('login'),
            {'email': 'login@example.com', 'password': 'secret123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['id'], user.id)

    def test_login_rejects_invalid_credentials(self):
        create_user(email='bad-login@example.com')
        response = self.client.post(
            reverse('login'),
            {'email': 'bad-login@example.com', 'password': 'wrong-password'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'Invalid email or password')

    def test_token_refresh_returns_new_access_token(self):
        create_user(email='refresh@example.com')
        login = self.client.post(
            reverse('login'),
            {'email': 'refresh@example.com', 'password': 'secret123'},
            format='json',
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

        refresh = login.data['refresh']
        response = self.client.post(
            reverse('token_refresh'),
            {'refresh': refresh},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
