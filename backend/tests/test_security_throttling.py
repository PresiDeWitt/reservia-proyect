from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.throttling import ChatRateThrottle, LoginRateThrottle


class APISecurityThrottlingTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username='throttle_user', password='StrongPass123!')

    def test_login_throttle_returns_429_after_limit(self):
        payload = {'email': self.user.username, 'password': 'StrongPass123!'}
        login_url = reverse('login')

        with patch.dict(LoginRateThrottle.THROTTLE_RATES, {'login': '2/minute'}, clear=False):
            first = self.client.post(login_url, payload, format='json')
            second = self.client.post(login_url, payload, format='json')
            third = self.client.post(login_url, payload, format='json')

        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(third.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_chat_throttle_returns_429_after_limit(self):
        payload = {'message': 'Hola IA'}
        chat_url = reverse('chat')

        with patch.dict(ChatRateThrottle.THROTTLE_RATES, {'chat': '2/minute'}, clear=False):
            with override_settings(OPENROUTER_API_KEY='test-key'):
                with patch('requests.post') as mock_post:
                    mock_response = MagicMock()
                    mock_response.status_code = 200
                    mock_response.json.return_value = {
                        'choices': [
                            {
                                'message': {
                                    'content': 'respuesta'
                                }
                            }
                        ]
                    }
                    mock_post.return_value = mock_response

                    first = self.client.post(chat_url, payload, format='json')
                    second = self.client.post(chat_url, payload, format='json')
                    third = self.client.post(chat_url, payload, format='json')

        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(third.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
