import json
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from portfolio_engine.models import Portfolio, UserProfile


class SecurityAuditTestCase(TestCase):
    """
    Security verification tests covering OWASP Top 10 vulnerabilities:
    - BOLA/IDOR (Broken Object Level Authorization)
    - Sensitive Data Exposure
    - Uncontrolled Resource Consumption (DoS / File Upload bombs)
    - Security Headers & Configuration
    """

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="test_sec_user", password="StrongPassword123!")
        self.client.force_authenticate(user=self.user)

    def test_oversized_file_upload_rejected(self):
        # 6MB dummy content exceeds 5MB limit
        large_content = b"A" * (6 * 1024 * 1024)
        large_file = SimpleUploadedFile("big_resume.txt", large_content, content_type="text/plain")

        response = self.client.post(
            "/api/ai/parse-resume/",
            {"file": large_file},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("File size exceeds 5MB limit", str(response.data))

    def test_oversized_text_input_rejected(self):
        # 120,000 characters exceeds 100k limit
        huge_text = "A" * 120000
        response = self.client.post(
            "/api/ai/parse-resume/",
            {"resume_text": huge_text},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Resume text exceeds 100,000 characters limit", str(response.data))

    def test_oversized_enhance_text_rejected(self):
        # 15,000 characters exceeds 10k limit
        huge_text = "B" * 15000
        response = self.client.post(
            "/api/ai/enhance/",
            {"raw_text": huge_text},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Text exceeds 10,000 characters limit", str(response.data))

    def test_oversized_sections_data_payload_rejected(self):
        # Payload > 1MB in sections_data
        huge_payload = {"profile": {"name": "Test"}, "bloat": "X" * (1100 * 1024)}
        response = self.client.post(
            "/api/portfolios/",
            {"title": "Oversized Test", "sections_data": huge_payload},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("sections_data payload exceeds 1MB limit", str(response.data))

    def test_security_headers_present(self):
        response = self.client.get("/api/public/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check security headers
        self.assertEqual(response.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(response.headers.get("X-Frame-Options"), "DENY")

    def test_no_sensitive_credentials_in_public_endpoint(self):
        portfolio = Portfolio.objects.create(
            user=self.user,
            title="Public Disclosure Test",
            is_published=True,
            sections_data={"profile": {"name": "Public Person"}},
        )
        unauth = APIClient()
        response = unauth.get(f"/api/public/portfolio/{portfolio.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Ensure no user credentials or internal IDs are leaked
        data_str = json.dumps(response.data)
        self.assertNotIn("password", data_str)
        self.assertNotIn("token", data_str)
        self.assertNotIn("email", response.data)  # Root level should not have user email
        self.assertNotIn("user_id", data_str)
