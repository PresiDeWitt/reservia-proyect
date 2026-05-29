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

    def test_parse_selection_index_helper(self):
        from api.views_chat import _parse_selection_index
        self.assertEqual(_parse_selection_index("1"), 0)
        self.assertEqual(_parse_selection_index("el 2"), 1)
        self.assertEqual(_parse_selection_index("la segunda"), 1)
        self.assertEqual(_parse_selection_index("segundo"), 1)
        self.assertEqual(_parse_selection_index("tercero"), 2)
        # Should not match dates
        self.assertIsNone(_parse_selection_index("el 2 de mayo"))

    def test_extract_booking_context_selection_and_correction(self):
        from api.views_chat import _extract_booking_context
        
        # Setup dummy restaurants
        r1 = create_restaurant(name='The Golden Fork', cuisine='Italian', rating=4.7)
        r2 = create_restaurant(name='Prime Cuts', cuisine='Steakhouse', rating=4.5)
        top_restaurants = [r1, r2]
        
        # Scenario 1: Assistant recommends two restaurants, user selects the second one using "el 2"
        history = [
            {"role": "user", "content": "cenar"},
            {"role": "assistant", "content": "Te recomiendo:\n1. The Golden Fork\n2. Prime Cuts\n¿Para cuántas personas?"}
        ]
        
        # The user replies "el 2"
        ctx = _extract_booking_context("el 2", history, top_restaurants)
        
        # Check that it resolved to Prime Cuts (r2), not The Golden Fork (r1)!
        self.assertEqual(ctx["restaurant"], r2)
        self.assertTrue(ctx["is_booking_intent"])
        
        # Scenario 2: User says "te has equivocao" to cancel/reset
        history.append({"role": "user", "content": "el 2"})
        history.append({"role": "assistant", "content": "Para tu reserva en Prime Cuts, necesito..."})
        
        ctx_correction = _extract_booking_context("te has equivocao", history, top_restaurants)
        
        # The state should be fully reset
        self.assertIsNone(ctx_correction["restaurant"])
        self.assertIsNone(ctx_correction["guests"])
        self.assertFalse(ctx_correction["is_booking_intent"])
        self.assertTrue(ctx_correction["is_correction"])
