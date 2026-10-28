from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from portfolio_engine.models import Portfolio, UserProfile

class ViewsTestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="alicepassword123"
        )
        self.token1 = Token.objects.create(user=self.user1)

        self.user2 = User.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="bobpassword123"
        )
        self.token2 = Token.objects.create(user=self.user2)

        self.portfolio1 = Portfolio.objects.create(
            user=self.user1,
            title="Alice's ML Portfolio",
            theme="minimalist",
            is_published=True,
            sections_data={
                "profile": {"name": "Alice ML", "bio": "Machine learning researcher."},
                "experience": [],
                "projects": [],
                "skills": ["PyTorch", "Transformers"]
            }
        )

        self.draft_portfolio = Portfolio.objects.create(
            user=self.user1,
            title="Alice's Private Draft",
            theme="executive",
            is_published=False,
            sections_data={"profile": {"name": "Alice Draft"}}
        )

    def test_health_check(self):
        url = reverse('health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("status"), "healthy")

    def test_user_registration(self):
        url = reverse('auth-register')
        payload = {
            "username": "charlie",
            "email": "charlie@example.com",
            "password": "strongPassword!456",
            "target_role": "DevOps Engineer",
            "bio": "Cloud and Kubernetes enthusiast."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["target_role"], "DevOps Engineer")

    def test_user_login(self):
        url = reverse('auth-login')
        payload = {
            "username": "alice",
            "password": "alicepassword123"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["token"], self.token1.key)

    def test_user_login_invalid_credentials(self):
        url = reverse('auth-login')
        payload = {
            "username": "alice",
            "password": "wrongpassword"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_portfolio_list_isolated_to_authenticated_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        url = reverse('portfolio-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Bob should see 0 portfolios
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2.key}')
        response_bob = self.client.get(url)
        self.assertEqual(response_bob.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_bob.data), 0)

    def test_portfolio_create(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        url = reverse('portfolio-list-create')
        payload = {
            "title": "Robotics Engineering Showcase",
            "theme": "modern",
            "sections_data": {
                "profile": {"name": "Alice Rob"},
                "experience": [],
                "projects": [],
                "skills": ["ROS2", "C++"]
            }
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Robotics Engineering Showcase")
        self.assertEqual(response.data["slug"], "robotics-engineering-showcase")

    def test_portfolio_update_and_user_isolation(self):
        # Bob cannot update Alice's portfolio
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2.key}')
        url = reverse('portfolio-detail', kwargs={'slug': self.portfolio1.slug})
        response = self.client.put(url, {"title": "Hacked Title"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Alice can update her own portfolio
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response_alice = self.client.put(url, {"theme": "executive"}, format='json')
        self.assertEqual(response_alice.status_code, status.HTTP_200_OK)
        self.portfolio1.refresh_from_db()
        self.assertEqual(self.portfolio1.theme, "executive")

    def test_public_portfolio_view(self):
        # Alice's published portfolio is publicly accessible without auth
        self.client.credentials()  # Unauthenticated
        url_published = reverse('public-portfolio-detail', kwargs={'slug': self.portfolio1.slug})
        resp_published = self.client.get(url_published)
        self.assertEqual(resp_published.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_published.data["title"], "Alice's ML Portfolio")

        # Alice's draft portfolio returns 404 to public visitors
        url_draft = reverse('public-portfolio-detail', kwargs={'slug': self.draft_portfolio.slug})
        resp_draft = self.client.get(url_draft)
        self.assertEqual(resp_draft.status_code, status.HTTP_404_NOT_FOUND)

    def test_ai_enhance_endpoint(self):
        url = reverse('ai-enhance')
        payload = {
            "raw_text": "Led backend refactor to improve database queries.",
            "target_role": "Principal Database Architect"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("enhanced_text", response.data)
        self.assertTrue(len(response.data["enhanced_text"]) > 0)

    def test_ai_parse_resume_endpoint(self):
        url = reverse('ai-parse-resume')
        payload = {
            "resume_text": "Alex Morgan\nSenior Cloud Architect\nSpecializing in high throughput architectures."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("sections", response.data)
        self.assertIn("profile", response.data["sections"])

