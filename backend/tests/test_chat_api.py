from unittest.mock import MagicMock, patch

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from tests.factories import create_restaurant


class ChatApiTests(APITestCase):
    def test_chat_requires_message(self):
        response = self.client.post('/api/chat/', {'message': ''}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Message required')

    @override_settings(OPENROUTER_API_KEY='dummy-test-key')
    @patch('requests.post')
    def test_chat_returns_reply_when_ai_service_is_configured(self, mock_post):
        create_restaurant(name='Sushi House', cuisine='Japanese', rating=4.8)

        # Mock OpenRouter response structure
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'choices': [
                {
                    'message': {
                        'content': 'Prueba de respuesta IA'
                    }
                }
            ]
        }
        mock_post.return_value = mock_response

        response = self.client.post(
            '/api/chat/',
            {
                'message': 'Quiero cenar sushi hoy',
                'history': [{'role': 'user', 'content': 'Busco algo japones'}],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reply'], 'Prueba de respuesta IA')
        
        # Verify it was called with the correct URL and headers
        self.assertTrue(mock_post.called)
        args, kwargs = mock_post.call_args
        self.assertEqual(args[0], 'https://openrouter.ai/api/v1/chat/completions')
        self.assertEqual(kwargs['headers']['Authorization'], 'Bearer dummy-test-key')
