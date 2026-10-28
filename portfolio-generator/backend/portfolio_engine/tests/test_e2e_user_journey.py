import json
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from portfolio_engine.models import Portfolio, UserProfile


class EndToEndUserJourneyTestCase(TestCase):
    """
    Simulates complete real-world user journeys as both authenticated and unauthenticated users.
    """

    def setUp(self):
        self.client = APIClient()

    def test_complete_user_lifecycle_and_security_controls(self):
        # ==========================================
        # STEP 1: Registration (User Alpha)
        # ==========================================
        reg_payload = {
            "username": "alice_architect",
            "email": "alice@cloudsystems.io",
            "password": "SecurePassword123!",
            "target_role": "Principal Cloud Architect",
            "bio": "Designing resilient distributed platforms.",
        }
        res_reg = self.client.post("/api/auth/register/", reg_payload, format="json")
        self.assertEqual(res_reg.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", res_reg.data)
        self.assertEqual(res_reg.data["user"]["username"], "alice_architect")
        self.assertEqual(res_reg.data["user"]["target_role"], "Principal Cloud Architect")
        token_alice = res_reg.data["token"]

        # ==========================================
        # STEP 2: Login validation
        # ==========================================
        # Invalid password attempt
        res_bad_login = self.client.post(
            "/api/auth/login/",
            {"username": "alice_architect", "password": "WrongPassword!"},
            format="json",
        )
        self.assertEqual(res_bad_login.status_code, status.HTTP_400_BAD_REQUEST)

        # Successful login
        res_login = self.client.post(
            "/api/auth/login/",
            {"username": "alice_architect", "password": "SecurePassword123!"},
            format="json",
        )
        self.assertEqual(res_login.status_code, status.HTTP_200_OK)
        self.assertEqual(res_login.data["token"], token_alice)

        # ==========================================
        # STEP 3: Authenticated Profile (MeView)
        # ==========================================
        # Without auth token -> 401
        res_me_unauth = self.client.get("/api/auth/me/")
        self.assertEqual(res_me_unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        # With auth token -> 200
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token_alice}")
        res_me = self.client.get("/api/auth/me/")
        self.assertEqual(res_me.status_code, status.HTTP_200_OK)
        self.assertEqual(res_me.data["username"], "alice_architect")

        # Update profile
        res_me_update = self.client.put(
            "/api/auth/me/",
            {"target_role": "VP of Cloud Architecture", "skills": ["Kubernetes", "Rust", "GCP"]},
            format="json",
        )
        self.assertEqual(res_me_update.status_code, status.HTTP_200_OK)
        self.assertEqual(res_me_update.data["target_role"], "VP of Cloud Architecture")
        self.assertEqual(res_me_update.data["skills"], ["Kubernetes", "Rust", "GCP"])

        # ==========================================
        # STEP 4: Portfolio Creation & Slug Collision
        # ==========================================
        portfolio_payload_1 = {
            "title": "Cloud Scale Innovations",
            "theme": "minimalist",
            "sections_data": {
                "profile": {
                    "name": "Alice Architect",
                    "target_role": "VP of Cloud Architecture",
                    "email": "alice@cloudsystems.io",
                    "bio": "Scaling enterprise architectures globally.",
                },
                "experience": [
                    {
                        "company": "Cloud Systems Corp",
                        "role": "Principal Architect",
                        "start_date": "2020",
                        "end_date": "Present",
                        "highlights": ["Reduced latency by 45% across global endpoints."],
                    }
                ],
                "projects": [
                    {
                        "title": "Mesh Gateway",
                        "description": "Zero-trust service mesh proxy.",
                        "technologies": ["Rust", "Envoy", "Docker"],
                        "link": "https://github.com/alice/mesh-gateway",
                    }
                ],
                "skills": ["Rust", "Kubernetes", "Docker", "GCP"],
            },
            "is_published": False,
        }

        res_create_1 = self.client.post("/api/portfolios/", portfolio_payload_1, format="json")
        self.assertEqual(res_create_1.status_code, status.HTTP_201_CREATED)
        slug_1 = res_create_1.data["slug"]
        self.assertEqual(slug_1, "cloud-scale-innovations")
        self.assertFalse(res_create_1.data["is_published"])

        # Create second portfolio with IDENTICAL title to verify slug collision resolution
        portfolio_payload_2 = {
            "title": "Cloud Scale Innovations",
            "theme": "modern",
            "is_published": False,
        }
        res_create_2 = self.client.post("/api/portfolios/", portfolio_payload_2, format="json")
        self.assertEqual(res_create_2.status_code, status.HTTP_201_CREATED)
        slug_2 = res_create_2.data["slug"]
        self.assertEqual(slug_2, "cloud-scale-innovations-1")
        self.assertNotEqual(slug_1, slug_2)

        # ==========================================
        # STEP 5: List Portfolios
        # ==========================================
        res_list = self.client.get("/api/portfolios/")
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_list.data), 2)

        # ==========================================
        # STEP 6: Public Access vs Privacy (Draft vs Published)
        # ==========================================
        unauth_client = APIClient()

        # Portfolio 1 is unpublished (is_published=False) -> Public endpoint MUST return 404
        res_pub_draft = unauth_client.get(f"/api/public/portfolio/{slug_1}/")
        self.assertEqual(res_pub_draft.status_code, status.HTTP_404_NOT_FOUND)

        # Now Alice publishes Portfolio 1
        res_publish = self.client.put(
            f"/api/portfolios/{slug_1}/",
            {"is_published": True, "theme": "executive"},
            format="json",
        )
        self.assertEqual(res_publish.status_code, status.HTTP_200_OK)
        self.assertTrue(res_publish.data["is_published"])
        self.assertEqual(res_publish.data["theme"], "executive")

        # Now Public endpoint MUST return 200 with sanitized public data
        res_pub_active = unauth_client.get(f"/api/public/portfolio/{slug_1}/")
        self.assertEqual(res_pub_active.status_code, status.HTTP_200_OK)
        self.assertEqual(res_pub_active.data["slug"], slug_1)
        self.assertEqual(res_pub_active.data["theme"], "executive")
        # Ensure sensitive user fields (like username, user id) are not exposed in public serializer
        self.assertNotIn("user", res_pub_active.data)
        self.assertNotIn("user_id", res_pub_active.data)

        # ==========================================
        # STEP 7: Broken Object Level Authorization (BOLA/IDOR) Checks
        # ==========================================
        # Register User Bob
        res_bob_reg = self.client.post(
            "/api/auth/register/",
            {"username": "bob_attacker", "password": "BobPassword999!"},
            format="json",
        )
        token_bob = res_bob_reg.data["token"]

        bob_client = APIClient()
        bob_client.credentials(HTTP_AUTHORIZATION=f"Token {token_bob}")

        # Bob lists his portfolios -> Should be empty (isolation check)
        res_bob_list = bob_client.get("/api/portfolios/")
        self.assertEqual(res_bob_list.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_bob_list.data), 0)

        # Bob attempts to GET Alice's private or published portfolio via authenticated owner endpoint
        res_bob_get = bob_client.get(f"/api/portfolios/{slug_1}/")
        self.assertEqual(res_bob_get.status_code, status.HTTP_404_NOT_FOUND)

        # Bob attempts to UPDATE Alice's portfolio (BOLA/IDOR write attempt)
        res_bob_put = bob_client.put(
            f"/api/portfolios/{slug_1}/",
            {"title": "Hacked Title by Bob"},
            format="json",
        )
        self.assertEqual(res_bob_put.status_code, status.HTTP_404_NOT_FOUND)

        # Bob attempts to DELETE Alice's portfolio (BOLA/IDOR delete attempt)
        res_bob_del = bob_client.delete(f"/api/portfolios/{slug_1}/")
        self.assertEqual(res_bob_del.status_code, status.HTTP_404_NOT_FOUND)

        # Verify Alice's portfolio was NOT modified or deleted
        res_alice_check = self.client.get(f"/api/portfolios/{slug_1}/")
        self.assertEqual(res_alice_check.status_code, status.HTTP_200_OK)
        self.assertEqual(res_alice_check.data["title"], "Cloud Scale Innovations")

        # ==========================================
        # STEP 8: Alice Deletes Portfolio 2
        # ==========================================
        res_del_2 = self.client.delete(f"/api/portfolios/{slug_2}/")
        self.assertEqual(res_del_2.status_code, status.HTTP_204_NO_CONTENT)

        # Verify Portfolio 2 is gone
        res_get_del_2 = self.client.get(f"/api/portfolios/{slug_2}/")
        self.assertEqual(res_get_del_2.status_code, status.HTTP_404_NOT_FOUND)

        # ==========================================
        # STEP 9: AI Endpoints Input Validation
        # ==========================================
        # Empty text parsing -> 400
        res_empty_ai = self.client.post("/api/ai/parse-resume/", {"resume_text": ""}, format="json")
        self.assertEqual(res_empty_ai.status_code, status.HTTP_400_BAD_REQUEST)

        # Valid text parsing
        res_valid_ai = self.client.post(
            "/api/ai/parse-resume/",
            {"resume_text": "Alice Architect\nVP of Cloud\nExtensive cloud background."},
            format="json",
        )
        self.assertEqual(res_valid_ai.status_code, status.HTTP_200_OK)
        self.assertIn("sections", res_valid_ai.data)
        self.assertIn("profile", res_valid_ai.data["sections"])

        # AI STAR Enhancement
        res_enhance = self.client.post(
            "/api/ai/enhance/",
            {"raw_text": "Built a fast cache system.", "target_role": "Backend Architect"},
            format="json",
        )
        self.assertEqual(res_enhance.status_code, status.HTTP_200_OK)
        self.assertIn("enhanced_text", res_enhance.data)

        # Empty enhancement text -> 400
        res_enhance_bad = self.client.post(
            "/api/ai/enhance/",
            {"raw_text": ""},
            format="json",
        )
        self.assertEqual(res_enhance_bad.status_code, status.HTTP_400_BAD_REQUEST)

        # ==========================================
        # STEP 10: System Healthcheck Probe
        # ==========================================
        res_health = unauth_client.get("/api/public/health/")
        self.assertEqual(res_health.status_code, status.HTTP_200_OK)
        self.assertEqual(res_health.data["status"], "healthy")

