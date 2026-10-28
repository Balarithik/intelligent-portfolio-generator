import json
from unittest.mock import MagicMock, patch
from django.test import TestCase
from portfolio_engine.services import (
    parse_resume_text,
    enhance_description,
    ParsedResumeSchema,
    ParsedExperience,
    ParsedProject,
)

class ServicesTestCase(TestCase):
    def test_parse_resume_empty_raises(self):
        with self.assertRaises(ValueError):
            parse_resume_text("")
        with self.assertRaises(ValueError):
            parse_resume_text("   ")

    def test_enhance_description_empty_returns_empty(self):
        self.assertEqual(enhance_description("", "Frontend Engineer"), "")
        self.assertEqual(enhance_description("   ", "Frontend Engineer"), "")

    @patch('portfolio_engine.services.get_genai_client')
    def test_mocked_gemini_parse_resume_success(self, mock_get_client):
        # Prepare structured mock response
        mock_schema_data = {
            "full_name": "Jordan Hayes",
            "target_role": "Staff Platform Engineer",
            "summary": "Proven track record in distributed infrastructure and cloud native reliability.",
            "skills": ["Kubernetes", "Go", "Python", "Terraform", "Kafka"],
            "experience": [
                {
                    "company": "Apex Cloud Systems",
                    "role": "Lead Infrastructure Architect",
                    "start_date": "2020",
                    "end_date": "Present",
                    "description": "Led multi-region platform rollout.",
                    "highlights": [
                        "Designed multi-region cluster handling 100k req/s with 99.999% reliability.",
                        "Decreased infrastructure compute spend by 28% via autoscaling policies."
                    ]
                }
            ],
            "projects": [
                {
                    "title": "MeshRouter",
                    "description": "High-throughput Envoy service mesh control plane.",
                    "technologies": ["Go", "gRPC", "Docker"],
                    "link": "https://github.com/apex/meshrouter"
                }
            ]
        }

        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = json.dumps(mock_schema_data)
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        resume_raw = "Jordan Hayes\nStaff Platform Engineer\nLed multi-region platform rollout at Apex Cloud..."
        result = parse_resume_text(resume_raw)

        self.assertIn("profile", result)
        self.assertEqual(result["profile"]["name"], "Jordan Hayes")
        self.assertEqual(result["profile"]["target_role"], "Staff Platform Engineer")
        self.assertEqual(len(result["experience"]), 1)
        self.assertEqual(result["experience"][0]["company"], "Apex Cloud Systems")
        self.assertEqual(len(result["projects"]), 1)
        self.assertIn("Kubernetes", result["skills"])

    @patch('portfolio_engine.services.get_genai_client')
    def test_mocked_gemini_enhance_description_success(self, mock_get_client):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = (
            "• Spearheaded migration of legacy billing services to event-driven architecture, reducing checkout latency by 45%.\n"
            "• Implemented idempotent payment webhooks, driving transaction failure rates down by 99.8% across $12M monthly volume."
        )
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        raw_text = "Worked on billing system migration and fixed webhooks."
        enhanced = enhance_description(raw_text, "Senior Backend Engineer")

        self.assertIn("reducing checkout latency by 45%", enhanced)
        self.assertIn("Spearheaded", enhanced)

    @patch('portfolio_engine.services.get_genai_client', return_value=None)
    def test_fallback_heuristic_when_gemini_unconfigured(self, _):
        # Test fallback parser
        parsed = parse_resume_text("Sarah Connor\nCybernetics Specialist\nDefending human systems.")
        self.assertIn("profile", parsed)
        self.assertEqual(parsed["profile"]["name"], "Sarah Connor")
        self.assertGreater(len(parsed["skills"]), 0)

        # Test fallback enhancer
        enhanced = enhance_description("built an api", "Backend Engineer")
        self.assertTrue(enhanced.startswith("•"))
        self.assertIn("Backend Engineer", enhanced)

