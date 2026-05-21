from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response

from .models import Restaurant
from .throttling import ChatRateThrottle


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([ChatRateThrottle])
def chat_view(request):
    import requests as http_requests
    import logging
    from django.conf import settings as django_settings

    logger = logging.getLogger(__name__)

    message = request.data.get("message", "").strip()
    history = request.data.get("history", [])
    lat = request.data.get("lat")
    lng = request.data.get("lng")

    if not message:
        return Response(
            {"error": "Message required"}, status=status.HTTP_400_BAD_REQUEST
        )

    api_key = getattr(django_settings, "OPENROUTER_API_KEY", "")
    if not api_key:
        return Response(
            {"error": "AI service not configured"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    restaurants_qs = Restaurant.objects.only("id", "name", "cuisine", "rating", "price_range", "address", "description", "lat", "lng")
    if lat and lng:
        try:
            lat_f, lng_f = float(lat), float(lng)
            restaurants_qs = restaurants_qs.filter(
                lat__gte=lat_f - 0.05, lat__lte=lat_f + 0.05,
                lng__gte=lng_f - 0.05, lng__lte=lng_f + 0.05,
            )
        except (TypeError, ValueError):
            pass
    top_restaurants = list(restaurants_qs.order_by('-rating')[:20])

    restaurant_lines = []
    for r in top_restaurants:
        restaurant_lines.append(
            f"- {r.name} | {r.cuisine} | {r.rating}/5 | {r.price_range} | {r.address}"
            + (f" | {r.description[:80]}" if r.description else "")
        )

    location_note = ""
    if lat and lng:
        try:
            location_note = (
                f"\nUser GPS: lat={float(lat):.4f}, lng={float(lng):.4f}. "
                "Mention distance or closeness when relevant using restaurant coordinates."
            )
        except (TypeError, ValueError):
            pass

    system_prompt = (
        "You are ReserVia's friendly AI assistant. "
        "ReserVia is a restaurant reservation platform. "
        "Help users find the perfect restaurant and guide them to book.\n\n"
        "Available restaurants:\n"
        + "\n".join(restaurant_lines)
        + location_note
        + "\n\nRules:\n"
        "- Only recommend restaurants listed above.\n"
        "- Be concise, warm and helpful.\n"
        "- Mention name, cuisine, rating, price range and why it fits.\n"
        "- To book, tell the user to click the restaurant name on the home page.\n"
        "- Respond in the same language the user writes in (Spanish or English).\n"
        "- Keep answers under 200 words."
    )

    safe_history = [
        {"role": m["role"], "content": m["content"]}
        for m in history
        if m.get("role") in ("user", "assistant") and m.get("content")
    ]
    safe_history.insert(0, {"role": "system", "content": system_prompt})
    safe_history.append({"role": "user", "content": message})

    try:
        resp = http_requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "google/gemma-3-4b-it:free",
                "messages": safe_history,
                "max_tokens": 400,
            },
            timeout=20,
        )
        data = resp.json()
        reply = data["choices"][0]["message"]["content"]
    except http_requests.Timeout:
        logger.warning("OpenRouter chat request timed out after 20s")
        return Response(
            {"error": "AI service timed out, please try again"},
            status=status.HTTP_504_GATEWAY_TIMEOUT,
        )
    except Exception as e:
        logger.error("Chat error: %s", str(e))
        return Response(
            {"error": "AI service temporarily unavailable"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response({"reply": reply})
