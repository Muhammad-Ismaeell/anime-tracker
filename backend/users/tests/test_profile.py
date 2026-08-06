from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase

from users.infrastructure.models import Profile


User = get_user_model()


class ProfileTests(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

        self.client.force_authenticate(
            user=self.user
        )


    def test_get_profile(self):

        response = self.client.get(
            "/api/users/profile/"
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.assertIn(
            "user",
            response.data["data"]
        )

        self.assertIn(
            "profile",
            response.data["data"]
        )


    def test_update_profile(self):

        response = self.client.patch(
            "/api/users/profile/update/",
            {
                "bio": "Anime developer",
                "favorite_genre": "Action"
            },
            format="multipart"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        profile = Profile.objects.get(
            user=self.user
        )


        self.assertEqual(
            profile.bio,
            "Anime developer"
        )


        self.assertEqual(
            profile.favorite_genre,
            "Action"
        )


    def test_update_empty_profile_fields(self):

        response = self.client.patch(
            "/api/users/profile/update/",
            {
                "bio": "",
            },
            format="multipart"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        profile = Profile.objects.get(
            user=self.user
        )


        self.assertEqual(
            profile.bio,
            ""
        )