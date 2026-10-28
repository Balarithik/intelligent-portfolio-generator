"""
Core URL Configuration.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('portfolio_engine.urls')),
]

