from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase

from users.infrastructure.models import Profile


User = get_user_model()


class ProfileTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123",
        )

        self.other_user = User.objects.create_user(
            username="otheruser",
            email="other@test.com",
            password="password123",
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
            200,
        )

        self.assertIn(
            "user",
            response.data["data"],
        )

        self.assertIn(
            "profile",
            response.data["data"],
        )

        self.assertEqual(
            response.data["data"]["user"]["username"],
            "testuser",
        )

    def test_update_profile(self):
        response = self.client.patch(
            "/api/users/profile/update/",
            {
                "bio": "Anime developer",
                "favorite_genre": "Action",
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        profile = Profile.objects.get(
            user=self.user
        )

        self.assertEqual(
            profile.bio,
            "Anime developer",
        )

        self.assertEqual(
            profile.favorite_genre,
            "Action",
        )

    def test_update_username(self):
        response = self.client.patch(
            "/api/users/profile/update/",
            {
                "username": "muhammad",
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.username,
            "muhammad",
        )

        self.assertEqual(
            response.data["data"]["user"]["username"],
            "muhammad",
        )

    def test_update_username_and_profile_together(self):
        response = self.client.patch(
            "/api/users/profile/update/",
            {
                "username": "anime_dev",
                "bio": "Backend developer",
                "favorite_genre": "Action",
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.user.refresh_from_db()

        profile = Profile.objects.get(
            user=self.user
        )

        self.assertEqual(
            self.user.username,
            "anime_dev",
        )

        self.assertEqual(
            profile.bio,
            "Backend developer",
        )

        self.assertEqual(
            profile.favorite_genre,
            "Action",
        )

    def test_duplicate_username_rejected(self):
        response = self.client.patch(
            "/api/users/profile/update/",
            {
                "username": "otheruser",
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertTrue(
            "username" in str(response.data)
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.username,
            "testuser",
        )


    def test_empty_username_rejected(self):
        response = self.client.patch(
            "/api/users/profile/update/",
            {
                "username": "   ",
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertTrue(
            "username" in str(response.data)
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.username,
            "testuser",
        )

    def test_update_empty_profile_fields(self):
        response = self.client.patch(
            "/api/users/profile/update/",
            {
                "bio": "",
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        profile = Profile.objects.get(
            user=self.user
        )

        self.assertEqual(
            profile.bio,
            "",
        )

    def test_profile_requires_authentication(self):
        self.client.force_authenticate(
            user=None
        )

        response = self.client.get(
            "/api/users/profile/"
        )

        self.assertEqual(
            response.status_code,
            401,
        )