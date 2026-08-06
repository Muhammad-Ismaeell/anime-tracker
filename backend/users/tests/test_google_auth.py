from unittest.mock import patch

from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase


User = get_user_model()


class GoogleLoginTests(APITestCase):

    @patch(
        "core.auth.views.id_token.verify_oauth2_token"
    )
    def test_google_login(
        self,
        mock_google
    ):

        mock_google.return_value = {
            "email": "google@test.com",
            "name": "Google User"
        }


        response = self.client.post(
            "/api/auth/google/",
            {
                "token": "fake-token"
            },
            format="json"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        self.assertTrue(
            User.objects.filter(
                email="google@test.com"
            ).exists()
        )


        self.assertIn(
            "access",
            response.data
        )


        self.assertEqual(
            response.data["user"]["email"],
            "google@test.com"
        )