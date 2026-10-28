from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Portfolio, UserProfile
from .serializers import (
    AIEnhanceRequestSerializer,
    LoginSerializer,
    PortfolioSerializer,
    PublicPortfolioSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)
from .services import enhance_description, extract_resume_text, parse_resume_text


class HealthCheckView(APIView):
    """
    Public healthcheck endpoint for Docker container probes.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "healthy", "service": "portfolio_engine"})


class RegisterView(APIView):
    """
    Register a new user, creates their UserProfile, and returns an auth token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            profile = getattr(user, 'profile', None)
            profile_data = UserProfileSerializer(profile).data if profile else {}
            return Response(
                {
                    "message": "User registered successfully.",
                    "token": token.key,
                    "user": profile_data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Authenticate user and return auth token and user profile.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            profile = getattr(user, 'profile', None)
            profile_data = UserProfileSerializer(profile).data if profile else {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
            return Response(
                {
                    "token": token.key,
                    "user": profile_data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """
    Return current authenticated user profile or update profile details.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AIResumeParseView(APIView):
    """
    POST /api/ai/parse-resume/
    Parses resume text or uploaded file text into structured sections.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'ai_endpoints'

    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB max upload limit
    MAX_TEXT_LENGTH = 100000  # 100k characters max

    def post(self, request):
        # Support text in JSON payload or uploaded TXT, PDF, and DOCX files.
        resume_text = request.data.get('resume_text', '')
        if not resume_text and 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            if uploaded_file.size > self.MAX_FILE_SIZE:
                return Response(
                    {"error": "File size exceeds 5MB limit."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                resume_text = extract_resume_text(uploaded_file)
            except ValueError as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except Exception:
                return Response(
                    {"error": "Could not extract text from the uploaded file."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not resume_text or not resume_text.strip():
            return Response(
                {"resume_text": ["This field is required or file must contain readable text."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(resume_text) > self.MAX_TEXT_LENGTH:
            return Response(
                {"error": "Resume text exceeds 100,000 characters limit."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            parsed_sections = parse_resume_text(resume_text)
            return Response({"sections": parsed_sections}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"AI Parsing failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AIEnhanceView(APIView):
    """
    POST /api/ai/enhance/
    Enhances bullet points or description using STAR method tailored to target role.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'ai_endpoints'

    MAX_TEXT_LENGTH = 10000  # 10k characters max

    def post(self, request):
        serializer = AIEnhanceRequestSerializer(data=request.data)
        if serializer.is_valid():
            raw_text = serializer.validated_data['raw_text']
            target_role = serializer.validated_data.get('target_role', 'Software Engineer')

            if len(raw_text) > self.MAX_TEXT_LENGTH:
                return Response(
                    {"error": "Text exceeds 10,000 characters limit."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                enhanced_text = enhance_description(raw_text, target_role)
                return Response({"enhanced_text": enhanced_text}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {"error": f"AI Enhancement failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PortfolioListCreateView(APIView):
    """
    GET /api/portfolios/: List all portfolios belonging to current authenticated user.
    POST /api/portfolios/: Create a new portfolio for current user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        portfolios = Portfolio.objects.filter(user=request.user)
        serializer = PortfolioSerializer(portfolios, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PortfolioSerializer(data=request.data)
        if serializer.is_valid():
            portfolio = serializer.save(user=request.user)
            return Response(PortfolioSerializer(portfolio).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PortfolioDetailView(APIView):
    """
    GET /api/portfolios/<slug>/: Retrieve user portfolio by slug.
    PUT /api/portfolios/<slug>/: Update portfolio sections, title, theme, or publication status.
    DELETE /api/portfolios/<slug>/: Delete portfolio.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, slug, user):
        return get_object_or_404(Portfolio, slug=slug, user=user)

    def get(self, request, slug):
        portfolio = self.get_object(slug, request.user)
        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data)

    def put(self, request, slug):
        portfolio = self.get_object(slug, request.user)
        serializer = PortfolioSerializer(portfolio, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(PortfolioSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        portfolio = self.get_object(slug, request.user)
        portfolio.delete()
        return Response(
            {"message": "Portfolio deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class PublicPortfolioDetailView(APIView):
    """
    GET /api/public/portfolio/<slug>/
    Unauthenticated endpoint returning publicly viewable portfolio.
    Only returns 200 if is_published=True; otherwise 404.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        portfolio = get_object_or_404(Portfolio, slug=slug, is_published=True)
        serializer = PublicPortfolioSerializer(portfolio)
        return Response(serializer.data)

