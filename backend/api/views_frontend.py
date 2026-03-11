from django.http import HttpResponse
from django.views import View
from pathlib import Path

class FrontendView(View):
    def get(self, request, *args, **kwargs):
        """Sirve index.html para rutas que no sean API"""
        frontend_index = Path(__file__).resolve().parent.parent.parent / 'frontend' / 'dist' / 'index.html'

        try:
            with open(frontend_index, 'r', encoding='utf-8') as f:
                content = f.read()
            return HttpResponse(content, content_type='text/html; charset=utf-8')
        except FileNotFoundError:
            return HttpResponse('Frontend not found. Build the frontend first.', status=404)
