from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase


User = get_user_model()


class MeTests(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password"
        )


        self.client.force_authenticate(
            user=self.user
        )


    def test_get_current_user(self):

        response = self.client.get(
            "/api/auth/me/"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        self.assertEqual(
            response.data["username"],
            "testuser"
        )


        self.assertEqual(
            response.data["email"],
            "test@test.com"
        )


    def test_me_requires_authentication(self):

        self.client.force_authenticate(
            user=None
        )


        response = self.client.get(
            "/api/auth/me/"
        )


        self.assertEqual(
            response.status_code,
            401
        )