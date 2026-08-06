from rest_framework.test import APITestCase
from django.urls import reverse

from django.contrib.auth import get_user_model


User = get_user_model()


class AuthTests(APITestCase):


    def test_register(self):

        response = self.client.post(
            "/api/auth/register/",
            {
                "username":"testuser",
                "email":"test@test.com",
                "password":"password123"
            }
        )


        self.assertEqual(
            response.status_code,
            200
        )


        self.assertIn(
            "access",
            response.data
        )


    def test_login(self):

        User.objects.create_user(
            username="john",
            password="password123"
        )


        response = self.client.post(
            "/api/auth/login/",
            {
                "username":"john",
                "password":"password123"
            }
        )


        self.assertEqual(
            response.status_code,
            200
        )


        self.assertIn(
            "access",
            response.data
        )


    def test_me_requires_auth(self):

        response = self.client.get(
            "/api/auth/me/"
        )


        self.assertEqual(
            response.status_code,
            401
        )