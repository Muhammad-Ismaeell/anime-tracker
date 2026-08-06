from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase

from django.core.cache import cache

from anime.infrastructure.models import Anime

from users.infrastructure.models import (
    UserAnimeStatus,
    FavoriteAnime,
)


User = get_user_model()


class DashboardTests(APITestCase):

    def setUp(self):

        cache.clear()

        self.user = User.objects.create_user(
            username="test",
            password="password"
        )

        self.client.force_authenticate(
            user=self.user
        )

        self.anime = Anime.objects.create(
            mal_id=1,
            title="Naruto",
            image="image.jpg"
        )


    def test_dashboard_stats(self):

        anime2 = Anime.objects.create(
            mal_id=2,
            title="One Piece",
            image="image2.jpg"
        )

        anime3 = Anime.objects.create(
            mal_id=3,
            title="Bleach",
            image="image3.jpg"
        )

        anime4 = Anime.objects.create(
            mal_id=4,
            title="Attack on Titan",
            image="image4.jpg"
        )


        UserAnimeStatus.objects.create(
            user=self.user,
            anime=self.anime,
            status="watching"
        )


        UserAnimeStatus.objects.create(
            user=self.user,
            anime=anime2,
            status="completed"
        )


        UserAnimeStatus.objects.create(
            user=self.user,
            anime=anime3,
            status="plan_to_watch"
        )


        UserAnimeStatus.objects.create(
            user=self.user,
            anime=anime4,
            status="dropped"
        )


        FavoriteAnime.objects.create(
            user=self.user,
            anime=self.anime
        )


        response = self.client.get(
            "/api/users/dashboard/"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        data = response.data["data"]


        self.assertEqual(
            data["watching"],
            1
        )

        self.assertEqual(
            data["completed"],
            1
        )


        self.assertEqual(
            data["plan_to_watch"],
            1
        )


        self.assertEqual(
            data["dropped"],
            1
        )


        self.assertEqual(
            data["favorites"],
            1
        )


        self.assertEqual(
            data["total"],
            4
        )


    def test_empty_dashboard(self):

        response = self.client.get(
            "/api/users/dashboard/"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        data = response.data["data"]


        self.assertEqual(
            data["watching"],
            0
        )


        self.assertEqual(
            data["completed"],
            0
        )


        self.assertEqual(
            data["plan_to_watch"],
            0
        )


        self.assertEqual(
            data["dropped"],
            0
        )


        self.assertEqual(
            data["favorites"],
            0
        )


        self.assertEqual(
            data["total"],
            0
        )


    def test_dashboard_requires_authentication(self):

        self.client.force_authenticate(
            user=None
        )


        response = self.client.get(
            "/api/users/dashboard/"
        )


        self.assertEqual(
            response.status_code,
            401
        )