from django.contrib.auth.models import User
from django.test import TestCase

from portfolio_engine.models import Portfolio, UserProfile


class ModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="alexdev",
            email="alex@example.com",
            password="securepassword123"
        )

    def test_user_profile_creation(self):
        profile = UserProfile.objects.create(
            user=self.user,
            target_role="Full Stack Engineer",
            bio="Building elegant web systems.",
            skills=["Python", "Django", "React"]
        )
        self.assertEqual(profile.user.username, "alexdev")
        self.assertEqual(profile.target_role, "Full Stack Engineer")
        self.assertEqual(len(profile.skills), 3)
        self.assertIn("Python", profile.skills)
        self.assertIn("Profile of alexdev", str(profile))

    def test_portfolio_slug_auto_generation(self):
        portfolio = Portfolio.objects.create(
            user=self.user,
            title="Senior Architect Portfolio",
            theme="minimalist"
        )
        self.assertEqual(portfolio.slug, "senior-architect-portfolio")
        self.assertFalse(portfolio.is_published)
        self.assertIn("profile", portfolio.sections_data)
        self.assertIn("experience", portfolio.sections_data)
        self.assertIn("projects", portfolio.sections_data)
        self.assertIn("skills", portfolio.sections_data)

    def test_portfolio_slug_collision_resolution(self):
        p1 = Portfolio.objects.create(
            user=self.user,
            title="Data Scientist",
            theme="executive"
        )
        p2 = Portfolio.objects.create(
            user=self.user,
            title="Data Scientist",
            theme="modern"
        )
        p3 = Portfolio.objects.create(
            user=self.user,
            title="Data Scientist",
            theme="minimalist"
        )

        self.assertEqual(p1.slug, "data-scientist")
        self.assertEqual(p2.slug, "data-scientist-1")
        self.assertEqual(p3.slug, "data-scientist-2")

