from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response

from .models import Restaurant
from .throttling import ChatRateThrottle


def generate_local_fallback(message, top_restaurants):
    msg = message.lower().strip()
    
    # 1. Detect language (Spanish by default, English if English keywords dominate)
    es_keywords = ["hola", "como", "restaurante", "comer", "reservar", "recomienda", "barato", "comida", "italiano", "sushi", "japonés", "mexicano", "gracias", "adios", "mesa", "carta"]
    en_keywords = ["hello", "hi", "restaurant", "eat", "book", "recommend", "cheap", "food", "italian", "sushi", "japanese", "mexican", "thanks", "bye", "table", "menu"]
    
    es_count = sum(1 for kw in es_keywords if kw in msg)
    en_count = sum(1 for kw in en_keywords if kw in msg)
    
    is_english = en_count > es_count
    
    # 2. Filter/Match cuisine types or categories
    selected = []
    
    # Keyword mappings
    cuisines_map = {
        "sushi": ["japonesa", "japanese", "sushi", "asiática", "asian"],
        "japon": ["japonesa", "japanese", "sushi"],
        "japan": ["japonesa", "japanese", "sushi"],
        "italia": ["italiana", "italian", "pasta", "pizza"],
        "pasta": ["italiana", "italian", "pasta"],
        "pizza": ["italiana", "italian", "pizza"],
        "mexic": ["mexicana", "mexican", "tacos"],
        "taco": ["mexicana", "mexican", "tacos"],
        "hamburg": ["americana", "american", "burger"],
        "burger": ["americana", "american", "burger"],
        "carne": ["americana", "american", "steakhouse", "grill"],
        "steak": ["americana", "american", "steakhouse", "grill"],
        "asiat": ["asiática", "asian", "sushi", "japonesa"],
        "asian": ["asiática", "asian", "sushi", "japonesa"],
    }
    
    # Check for cuisine match
    matched_cuisines = []
    for kw, targets in cuisines_map.items():
        if kw in msg:
            matched_cuisines.extend(targets)
            
    # Filter top_restaurants
    if matched_cuisines:
        for r in top_restaurants:
            cuisine_lower = r.cuisine.lower()
            if any(target in cuisine_lower for target in matched_cuisines):
                selected.append(r)
                
    # If no cuisine matched, check other attributes (cheap, romantic, best)
    if not selected:
        if any(kw in msg for kw in ["barato", "economico", "cheap", "precio bajo"]):
            selected = [r for r in top_restaurants if r.price_range == "€"]
        elif any(kw in msg for kw in ["caro", "lujo", "expensive", "premium"]):
            selected = [r for r in top_restaurants if r.price_range in ("€€€", "€€€€")]
        elif any(kw in msg for kw in ["mejor", "top", "bueno", "stars", "estrellas", "rating"]):
            selected = [r for r in top_restaurants if r.rating >= 4.5]
            
    # Default selection if nothing specific matched
    if not selected:
        selected = top_restaurants[:2]
    else:
        selected = selected[:2]
        
    # 3. Formulate the response
    if is_english:
        response = (
            "Hello! I am ReserVia's AI Assistant. "
            "I'd be happy to help you find the perfect restaurant. "
            "Based on your request, here are my recommendations:\n\n"
        )
        for r in selected:
            desc_part = f" - *{r.description[:120]}*" if r.description else ""
            response += (
                f"📍 **{r.name}** ({r.cuisine} cuisine)\n"
                f"   - Rating: ⭐ {r.rating}/5 | Price Range: {r.price_range}\n"
                f"   - Address: {r.address}{desc_part}\n\n"
            )
        response += (
            "To book a table, simply click on the restaurant's name on the home page or search map. "
            "Is there anything else I can help you with?"
        )
    else:
        response = (
            "¡Hola! Soy el asistente de IA de ReserVia. "
            "Estaré encantado de ayudarte a encontrar el lugar ideal para comer o cenar. "
            "Basándome en tu búsqueda, te recomiendo:\n\n"
        )
        for r in selected:
            desc_part = f" - *{r.description[:120]}*" if r.description else ""
            response += (
                f"📍 **{r.name}** (Cocina {r.cuisine})\n"
                f"   - Valoración: ⭐ {r.rating}/5 | Precios: {r.price_range}\n"
                f"   - Dirección: {r.address}{desc_part}\n\n"
            )
        response += (
            "Para realizar una reserva, simplemente haz clic en el nombre del restaurante en la página de inicio o en el mapa. "
            "¿Hay algo más en lo que pueda ayudarte?"
        )
        
    return response


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
        if resp.status_code == 200:
            data = resp.json()
            reply = data["choices"][0]["message"]["content"]
        else:
            logger.warning("OpenRouter returned status code %s. Falling back to local assistant.", resp.status_code)
            reply = generate_local_fallback(message, top_restaurants)
    except http_requests.Timeout:
        logger.warning("OpenRouter chat request timed out after 20s. Falling back to local assistant.")
        reply = generate_local_fallback(message, top_restaurants)
    except Exception as e:
        logger.warning("Chat error: %s. Falling back to local assistant.", str(e))
        reply = generate_local_fallback(message, top_restaurants)

    return Response({"reply": reply})
