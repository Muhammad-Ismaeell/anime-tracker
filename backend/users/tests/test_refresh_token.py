from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase

from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class RefreshTokenTests(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            username="testuser",
            password="password123"
        )

        self.refresh = str(
            RefreshToken.for_user(self.user)
        )


    def test_refresh_token(self):

        response = self.client.post(
            "/api/auth/refresh/",
            {
                "refresh": self.refresh
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.assertIn(
            "access",
            response.data
        )


    def test_invalid_refresh_token(self):

        response = self.client.post(
            "/api/auth/refresh/",
            {
                "refresh": "invalid"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            401
        )


    def test_missing_refresh_token(self):

        response = self.client.post(
            "/api/auth/refresh/",
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            401
        )