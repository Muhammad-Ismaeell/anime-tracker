from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase

from anime.infrastructure.models import Anime
from users.infrastructure.models import Activity


User = get_user_model()


class ActivityTests(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

        self.other_user = User.objects.create_user(
            username="other",
            email="other@test.com",
            password="password123"
        )


        self.anime = Anime.objects.create(
            mal_id=1,
            title="Naruto",
            image="image.jpg"
        )


        self.client.force_authenticate(
            user=self.user
        )


    def test_activity_feed(self):

        Activity.objects.create(
            user=self.user,
            anime=self.anime,
            action="FAVORITED"
        )


        response = self.client.get(
            "/api/users/activity/"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        data = response.data["data"]


        self.assertIn(
            "results",
            data
        )


        self.assertEqual(
            len(data["results"]),
            1
        )


        self.assertEqual(
            data["results"][0]["action"],
            "FAVORITED"
        )


    def test_activity_only_user_activities(self):

        Activity.objects.create(
            user=self.user,
            anime=self.anime,
            action="WATCHING"
        )


        Activity.objects.create(
            user=self.other_user,
            anime=self.anime,
            action="COMPLETED"
        )


        response = self.client.get(
            "/api/users/activity/"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        self.assertEqual(
            len(response.data["data"]["results"]),
            1
        )


        self.assertEqual(
            response.data["data"]["results"][0]["action"],
            "WATCHING"
        )


    def test_activity_pagination(self):

        for i in range(25):

            Activity.objects.create(
                user=self.user,
                anime=self.anime,
                action="WATCHING"
            )


        response = self.client.get(
            "/api/users/activity/"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        data = response.data["data"]


        self.assertEqual(
            len(data["results"]),
            20
        )


        self.assertIsNotNone(
            data["next"]
        )


    def test_activity_requires_authentication(self):

        self.client.force_authenticate(
            user=None
        )


        response = self.client.get(
            "/api/users/activity/"
        )


        self.assertEqual(
            response.status_code,
            401
        )