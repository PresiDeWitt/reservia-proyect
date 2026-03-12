from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView
from api.views_frontend import FrontendView
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Servir archivos estáticos
if settings.DEBUG is False:
    urlpatterns += [
        path('static/<path:path>', serve, {'document_root': settings.STATIC_ROOT}),
    ]

# Servir frontend React para todas las rutas que no sean API o admin
urlpatterns += [
    re_path(r'^(?!api|admin|static|assets).*$', FrontendView.as_view(), name='frontend'),
]
