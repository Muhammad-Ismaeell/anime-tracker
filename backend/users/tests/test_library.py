
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from anime.infrastructure.models import Anime
from users.infrastructure.models import (
    Activity,
    UserAnimeStatus,
)


User = get_user_model()


class LibraryTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="john",
            email="john@test.com",
            password="password123",
        )

        self.anime = Anime.objects.create(
            mal_id=1,
            title="Naruto",
            episodes=64,
        )

        self.client.force_authenticate(
            user=self.user
        )

    def test_add_anime_to_library(self):
        response = self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "watching",
                "progress": 5,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        library = UserAnimeStatus.objects.get(
            user=self.user,
            anime=self.anime,
        )

        self.assertEqual(
            library.status,
            "watching",
        )

        self.assertEqual(
            library.progress,
            5,
        )

        self.assertEqual(
            Activity.objects.filter(
                user=self.user,
                anime=self.anime,
            ).count(),
            1,
        )

        self.assertEqual(
            Activity.objects.get(
                user=self.user,
                anime=self.anime,
            ).action,
            "WATCHING",
        )

    def test_progress_cannot_exceed_anime_episode_count(self):
        response = self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "watching",
                "progress": 100,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        library = UserAnimeStatus.objects.get(
            user=self.user,
            anime=self.anime,
        )

        self.assertEqual(
            library.progress,
            64,
        )

    def test_progress_equal_to_episode_count_is_allowed(self):
        response = self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "watching",
                "progress": 64,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        library = UserAnimeStatus.objects.get(
            user=self.user,
            anime=self.anime,
        )

        self.assertEqual(
            library.progress,
            64,
        )

    def test_airing_anime_progress_cannot_exceed_current_episode_count(self):
        airing_anime = Anime.objects.create(
            mal_id=2,
            title="Currently Airing Anime",
            episodes=12,
            status="Currently Airing",
        )

        response = self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 2,
                "status": "watching",
                "progress": 1000,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        library = UserAnimeStatus.objects.get(
            user=self.user,
            anime=airing_anime,
        )

        self.assertEqual(
            library.progress,
            12,
        )

    def test_negative_progress_becomes_zero(self):
        response = self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "watching",
                "progress": -10,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        library = UserAnimeStatus.objects.get(
            user=self.user,
            anime=self.anime,
        )

        self.assertEqual(
            library.progress,
            0,
        )

    def test_update_progress_without_duplicate_activity(self):
        UserAnimeStatus.objects.create(
            user=self.user,
            anime=self.anime,
            status="watching",
            progress=1,
        )

        Activity.objects.create(
            user=self.user,
            anime=self.anime,
            action="WATCHING",
        )

        response = self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "watching",
                "progress": 10,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        library = UserAnimeStatus.objects.get(
            user=self.user,
            anime=self.anime,
        )

        self.assertEqual(
            library.progress,
            10,
        )

        self.assertEqual(
            Activity.objects.filter(
                user=self.user,
                anime=self.anime,
            ).count(),
            1,
        )

    def test_repeating_same_status_does_not_create_activity(self):
        self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "watching",
                "progress": 5,
            },
            format="json",
        )

        self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "watching",
                "progress": 5,
            },
            format="json",
        )

        self.assertEqual(
            UserAnimeStatus.objects.filter(
                user=self.user,
                anime=self.anime,
            ).count(),
            1,
        )

        self.assertEqual(
            Activity.objects.filter(
                user=self.user,
                anime=self.anime,
            ).count(),
            1,
        )

    def test_completed_to_completed_does_not_create_activity(self):
        self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "completed",
                "progress": 0,
            },
            format="json",
        )

        self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "completed",
                "progress": 0,
            },
            format="json",
        )

        library = UserAnimeStatus.objects.get(
            user=self.user,
            anime=self.anime,
        )

        self.assertEqual(
            library.status,
            "completed",
        )

        self.assertEqual(
            library.progress,
            64,
        )

        self.assertEqual(
            Activity.objects.filter(
                user=self.user,
                anime=self.anime,
                action="COMPLETED",
            ).count(),
            1,
        )

    def test_status_change_creates_new_activity(self):
        self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "watching",
                "progress": 5,
            },
            format="json",
        )

        self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "completed",
            },
            format="json",
        )

        activities = Activity.objects.filter(
            user=self.user,
            anime=self.anime,
        ).order_by("created_at")

        self.assertEqual(
            activities.count(),
            2,
        )

        self.assertEqual(
            list(
                activities.values_list(
                    "action",
                    flat=True,
                )
            ),
            [
                "WATCHING",
                "COMPLETED",
            ],
        )

    def test_remove_from_library(self):
        UserAnimeStatus.objects.create(
            user=self.user,
            anime=self.anime,
            status="watching",
        )

        response = self.client.delete(
            "/api/users/library/1/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertFalse(
            UserAnimeStatus.objects.filter(
                user=self.user,
                anime=self.anime,
            ).exists()
        )

        self.assertEqual(
            Activity.objects.filter(
                user=self.user,
                anime=self.anime,
                action="REMOVED",
            ).count(),
            1,
        )

    def test_remove_nonexistent_library_item_does_not_create_activity(self):
        response = self.client.delete(
            "/api/users/library/1/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertFalse(
            UserAnimeStatus.objects.filter(
                user=self.user,
                anime=self.anime,
            ).exists()
        )

        self.assertFalse(
            Activity.objects.filter(
                user=self.user,
                anime=self.anime,
                action="REMOVED",
            ).exists()
        )

    def test_library_requires_auth(self):
        self.client.force_authenticate(
            user=None
        )

        response = self.client.get(
            "/api/users/library/"
        )

        self.assertEqual(
            response.status_code,
            401,
        )
