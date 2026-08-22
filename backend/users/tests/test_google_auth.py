from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from users.infrastructure.models import EmailVerification


User = get_user_model()


class GoogleLoginTests(APITestCase):

    @patch(
        "core.auth.views.id_token.verify_oauth2_token"
    )
    def test_google_login(
        self,
        mock_google,
    ):
        mock_google.return_value = {
            "email": "google@test.com",
            "name": "Google User",
            "sub": "google-sub-123",
            "email_verified": True,
        }

        response = self.client.post(
            "/api/auth/google/",
            {
                "token": "fake-token",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        user = User.objects.get(
            email="google@test.com"
        )

        self.assertEqual(
            user.google_sub,
            "google-sub-123",
        )

        self.assertEqual(
            user.first_name,
            "Google User",
        )

        self.assertIn(
            "access",
            response.data,
        )

        self.assertIn(
            "refresh",
            response.data,
        )

        self.assertEqual(
            response.data["user"]["email"],
            "google@test.com",
        )

        verification = (
            EmailVerification.objects.get(
                user=user
            )
        )

        self.assertIsNotNone(
            verification.verified_at
        )

    @patch(
        "core.auth.views.id_token.verify_oauth2_token"
    )
    def test_google_login_unverified_email(
        self,
        mock_google,
    ):
        mock_google.return_value = {
            "email": "google@test.com",
            "name": "Google User",
            "sub": "google-sub-123",
            "email_verified": False,
        }

        response = self.client.post(
            "/api/auth/google/",
            {
                "token": "fake-token",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertEqual(
            response.data["detail"],
            "Google email is not verified.",
        )

        self.assertFalse(
            User.objects.filter(
                email="google@test.com"
            ).exists()
        )

    @patch(
        "core.auth.views.id_token.verify_oauth2_token"
    )
    def test_google_login_links_existing_user(
        self,
        mock_google,
    ):
        user = User.objects.create_user(
            username="muhammad",
            email="google@test.com",
            password="password123",
        )

        mock_google.return_value = {
            "email": "google@test.com",
            "name": "Google User",
            "sub": "google-sub-456",
            "email_verified": True,
        }

        response = self.client.post(
            "/api/auth/google/",
            {
                "token": "fake-token",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        user.refresh_from_db()

        self.assertEqual(
            User.objects.filter(
                email="google@test.com"
            ).count(),
            1,
        )

        self.assertEqual(
            user.google_sub,
            "google-sub-456",
        )

        self.assertEqual(
            user.username,
            "muhammad",
        )

    @patch(
        "core.auth.views.id_token.verify_oauth2_token"
    )
    def test_google_login_invalid_identity(
        self,
        mock_google,
    ):
        mock_google.return_value = {
            "email": "google@test.com",
            "name": "Google User",
            "email_verified": True,
        }

        response = self.client.post(
            "/api/auth/google/",
            {
                "token": "fake-token",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertEqual(
            response.data["detail"],
            "Invalid Google identity.",
        )