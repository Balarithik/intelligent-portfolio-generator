from django.urls import path

from .views import (
    AIEnhanceView,
    AIResumeParseView,
    HealthCheckView,
    LoginView,
    MeView,
    PortfolioDetailView,
    PortfolioListCreateView,
    PublicPortfolioDetailView,
    RegisterView,
)

urlpatterns = [
    # Health probe
    path('public/health/', HealthCheckView.as_view(), name='health-check'),

    # Authentication
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', MeView.as_view(), name='auth-me'),

    # AI Endpoints
    path('ai/parse-resume/', AIResumeParseView.as_view(), name='ai-parse-resume'),
    path('ai/enhance/', AIEnhanceView.as_view(), name='ai-enhance'),

    # User Portfolios (Authenticated)
    path('portfolios/', PortfolioListCreateView.as_view(), name='portfolio-list-create'),
    path('portfolios/<slug:slug>/', PortfolioDetailView.as_view(), name='portfolio-detail'),

    # Public Portfolio (Unauthenticated)
    path('public/portfolio/<slug:slug>/', PublicPortfolioDetailView.as_view(), name='public-portfolio-detail'),
]

