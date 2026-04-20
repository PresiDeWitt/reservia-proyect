from types import SimpleNamespace
from unittest.mock import patch

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from tests.factories import create_restaurant


class ChatApiTests(APITestCase):
    def test_chat_requires_message(self):
        response = self.client.post('/api/chat/', {'message': ''}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Message required')

    @override_settings(ANTHROPIC_API_KEY='dummy-test-key')
    @patch('anthropic.Anthropic')
    def test_chat_returns_reply_when_ai_service_is_configured(self, anthropic_client):
        create_restaurant(name='Sushi House', cuisine='Japanese', rating=4.8)

        anthropic_client.return_value.messages.create.return_value = SimpleNamespace(
            content=[SimpleNamespace(text='Prueba de respuesta IA')]
        )

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
        anthropic_client.assert_called_once_with(api_key='dummy-test-key')
