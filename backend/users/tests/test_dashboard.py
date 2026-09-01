
from django.contrib.auth import get_user_model
from django.core.cache import cache

from rest_framework.test import APITestCase

from anime.infrastructure.models import Anime

from users.infrastructure.models import (
    UserAnimeStatus,
    Activity,
)


User = get_user_model()


class DashboardTests(APITestCase):

    def setUp(self):

        cache.clear()

        self.user = User.objects.create_user(
            username="test",
            password="password",
        )

        self.client.force_authenticate(
            user=self.user
        )

        self.anime = Anime.objects.create(
            mal_id=1,
            title="Naruto",
            image="image.jpg",
            episodes=220,
        )


    def test_dashboard_stats(self):

        anime2 = Anime.objects.create(
            mal_id=2,
            title="One Piece",
            image="image2.jpg",
            episodes=1000,
        )

        anime3 = Anime.objects.create(
            mal_id=3,
            title="Bleach",
            image="image3.jpg",
            episodes=366,
        )

        anime4 = Anime.objects.create(
            mal_id=4,
            title="Attack on Titan",
            image="image4.jpg",
            episodes=87,
        )

        UserAnimeStatus.objects.create(
            user=self.user,
            anime=self.anime,
            status="watching",
            progress=50,
        )

        UserAnimeStatus.objects.create(
            user=self.user,
            anime=anime2,
            status="completed",
            progress=1000,
        )

        UserAnimeStatus.objects.create(
            user=self.user,
            anime=anime3,
            status="plan_to_watch",
            progress=0,
        )

        UserAnimeStatus.objects.create(
            user=self.user,
            anime=anime4,
            status="dropped",
            progress=10,
        )

        Activity.objects.create(
            user=self.user,
            anime=self.anime,
            action="WATCHING",
        )

        response = self.client.get(
            "/api/users/dashboard/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        data = response.data["data"]


        # =====================================================
        # LIBRARY STATS
        # =====================================================

        self.assertEqual(
            data["total"],
            4,
        )

        self.assertEqual(
            data["watching"],
            1,
        )

        self.assertEqual(
            data["completed"],
            1,
        )

        self.assertEqual(
            data["plan_to_watch"],
            1,
        )

        self.assertEqual(
            data["dropped"],
            1,
        )


        # =====================================================
        # OVERALL PROGRESS
        # =====================================================

        self.assertEqual(
            data["progress"]["episodes_watched"],
            1050,
        )

        self.assertEqual(
            data["progress"]["episodes_available"],
            1220,
        )

        self.assertEqual(
            data["progress"]["percentage"],
            86,
        )


        # =====================================================
        # CURRENTLY WATCHING
        # =====================================================

        self.assertEqual(
            len(data["currently_watching"]),
            1,
        )

        watching = data["currently_watching"][0]

        self.assertEqual(
            watching["id"],
            self.anime.mal_id,
        )

        self.assertEqual(
            watching["title"],
            "Naruto",
        )

        self.assertEqual(
            watching["episodes"],
            220,
        )

        self.assertEqual(
            watching["progress"],
            50,
        )


        # =====================================================
        # RECENT ACTIVITY
        # =====================================================

        self.assertEqual(
            len(data["recent_activity"]),
            1,
        )

        activity = data["recent_activity"][0]

        self.assertEqual(
            activity["action"],
            "WATCHING",
        )

        self.assertEqual(
            activity["anime"]["id"],
            self.anime.mal_id,
        )

        self.assertEqual(
            activity["anime"]["title"],
            "Naruto",
        )


        # =====================================================
        # RECENTLY COMPLETED
        # =====================================================

        self.assertEqual(
            len(data["recently_completed"]),
            1,
        )

        completed = data["recently_completed"][0]

        self.assertEqual(
            completed["id"],
            anime2.mal_id,
        )

        self.assertEqual(
            completed["title"],
            "One Piece",
        )


    def test_empty_dashboard(self):

        response = self.client.get(
            "/api/users/dashboard/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        data = response.data["data"]


        # =====================================================
        # LIBRARY STATS
        # =====================================================

        self.assertEqual(
            data["total"],
            0,
        )

        self.assertEqual(
            data["watching"],
            0,
        )

        self.assertEqual(
            data["completed"],
            0,
        )

        self.assertEqual(
            data["plan_to_watch"],
            0,
        )

        self.assertEqual(
            data["dropped"],
            0,
        )


        # =====================================================
        # PROGRESS
        # =====================================================

        self.assertEqual(
            data["progress"]["episodes_watched"],
            0,
        )

        self.assertEqual(
            data["progress"]["episodes_available"],
            0,
        )

        self.assertEqual(
            data["progress"]["percentage"],
            0,
        )


        # =====================================================
        # LISTS
        # =====================================================

        self.assertEqual(
            data["currently_watching"],
            [],
        )

        self.assertEqual(
            data["recent_activity"],
            [],
        )

        self.assertEqual(
            data["recently_completed"],
            [],
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
            401,
        )
