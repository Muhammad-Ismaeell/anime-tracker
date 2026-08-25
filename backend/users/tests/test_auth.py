import hashlib
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from users.infrastructure.models import EmailVerification


User = get_user_model()


class AuthTests(APITestCase):

    def test_register(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "testuser",
                "email": "test@test.com",
                "password": "AnimeTracker!2026",
            },
        )

        self.assertEqual(
            response.status_code,
            201,
        )

        self.assertEqual(
            response.data["email"],
            "test@test.com",
        )

        self.assertIn(
            "detail",
            response.data,
        )

        self.assertNotIn(
            "access",
            response.data,
        )

        self.assertNotIn(
            "refresh",
            response.data,
        )

        self.assertTrue(
            EmailVerification.objects.filter(
                user__username="testuser",
            ).exists()
        )

    def test_login_verified_user(self):
        user = User.objects.create_user(
            username="john",
            email="john@test.com",
            password="password123",
        )

        EmailVerification.objects.create(
            user=user,
            token_hash="test-token-hash",
            expires_at=timezone.now() + timedelta(hours=24),
            verified_at=timezone.now(),
        )

        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "john",
                "password": "password123",
            },
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertIn(
            "access",
            response.data,
        )

        self.assertIn(
            "refresh",
            response.data,
        )

    def test_unverified_user_cannot_login(self):
        User.objects.create_user(
            username="unverified",
            email="unverified@test.com",
            password="password123",
        )

        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "unverified",
                "password": "password123",
            },
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        self.assertEqual(
            response.data["detail"],
            "Please verify your email before logging in.",
        )

    def test_verify_email(self):
        user = User.objects.create_user(
            username="verified",
            email="verified@test.com",
            password="password123",
        )

        raw_token = "test-verification-token"

        token_hash = hashlib.sha256(
            raw_token.encode("utf-8")
        ).hexdigest()

        EmailVerification.objects.create(
            user=user,
            token_hash=token_hash,
            expires_at=timezone.now() + timedelta(hours=24),
        )

        response = self.client.get(
            "/api/auth/verify-email/",
            {
                "token": raw_token,
            },
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        verification = EmailVerification.objects.get(
            user=user,
        )

        self.assertIsNotNone(
            verification.verified_at,
        )

    def test_me_requires_auth(self):
        response = self.client.get(
            "/api/auth/me/"
        )

        self.assertEqual(
            response.status_code,
            401,
        )