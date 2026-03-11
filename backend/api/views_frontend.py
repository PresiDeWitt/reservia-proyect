from django.http import FileResponse
from django.views import View
from pathlib import Path
import os

class FrontendView(View):
    def get(self, request, *args, **kwargs):
        """Sirve index.html para rutas que no sean API"""
        frontend_index = Path(__file__).resolve().parent.parent.parent / 'frontend' / 'dist' / 'index.html'

        if frontend_index.exists():
            return FileResponse(open(frontend_index, 'rb'), content_type='text/html')
        else:
            return FileResponse(b'Frontend not found', status=404)
