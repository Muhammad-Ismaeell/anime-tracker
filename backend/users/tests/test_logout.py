from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase

from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class LogoutTests(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            username="testuser",
            password="password123"
        )

        self.refresh = str(
            RefreshToken.for_user(self.user)
        )


    def test_logout(self):

        response = self.client.post(
            "/api/auth/logout/",
            {
                "refresh": self.refresh
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.assertEqual(
            response.data["message"],
            "Logged out successfully"
        )


    def test_logout_invalid_token(self):

        response = self.client.post(
            "/api/auth/logout/",
            {
                "refresh": "invalid"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            200
        )