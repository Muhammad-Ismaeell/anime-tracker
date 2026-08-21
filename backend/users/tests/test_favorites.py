from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from anime.infrastructure.models import Anime
from users.infrastructure.models import Activity, FavoriteAnime


User = get_user_model()


class FavoriteTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="john",
            email="john@test.com",
            password="password123",
        )

        self.other_user = User.objects.create_user(
            username="other",
            email="other@test.com",
            password="password123",
        )

        self.anime = Anime.objects.create(
            mal_id=1,
            title="Naruto",
        )

        self.client.force_authenticate(
            user=self.user
        )

    def test_add_favorite(self):
        response = self.client.post(
            "/api/users/favorites/toggle/",
            {"anime_id": 1},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertTrue(
            response.data["data"]["added"]
        )

        self.assertTrue(
            FavoriteAnime.objects.filter(
                user=self.user,
                anime=self.anime,
            ).exists()
        )

        self.assertEqual(
            Activity.objects.filter(
                user=self.user,
                anime=self.anime,
                action="FAVORITED",
            ).count(),
            1,
        )

    def test_add_favorite_twice_does_not_create_duplicate(self):
        self.client.post(
            "/api/users/favorites/toggle/",
            {"anime_id": 1},
            format="json",
        )

        self.assertEqual(
            FavoriteAnime.objects.filter(
                user=self.user,
                anime=self.anime,
            ).count(),
            1,
        )

        # Toggle again removes it.
        response = self.client.post(
            "/api/users/favorites/toggle/",
            {"anime_id": 1},
            format="json",
        )

        self.assertFalse(
            response.data["data"]["added"]
        )

        self.assertEqual(
            FavoriteAnime.objects.filter(
                user=self.user,
                anime=self.anime,
            ).count(),
            0,
        )

    def test_remove_favorite_creates_unfavorited_activity(self):
        self.client.post(
            "/api/users/favorites/toggle/",
            {"anime_id": 1},
            format="json",
        )

        self.client.post(
            "/api/users/favorites/toggle/",
            {"anime_id": 1},
            format="json",
        )

        self.assertEqual(
            Activity.objects.filter(
                user=self.user,
                anime=self.anime,
                action="UNFAVORITED",
            ).count(),
            1,
        )

        self.assertEqual(
            FavoriteAnime.objects.filter(
                user=self.user,
                anime=self.anime,
            ).count(),
            0,
        )

    def test_toggle_again_after_remove_adds_favorite(self):
        self.client.post(
            "/api/users/favorites/toggle/",
            {"anime_id": 1},
            format="json",
        )

        self.client.post(
            "/api/users/favorites/toggle/",
            {"anime_id": 1},
            format="json",
        )

        response = self.client.post(
            "/api/users/favorites/toggle/",
            {"anime_id": 1},
            format="json",
        )

        self.assertTrue(
            response.data["data"]["added"]
        )

        self.assertEqual(
            FavoriteAnime.objects.filter(
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
            3,
        )

    def test_user_favorites_are_isolated(self):
        FavoriteAnime.objects.create(
            user=self.other_user,
            anime=self.anime,
        )

        response = self.client.get(
            "/api/users/favorites/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        results = response.data["data"]["results"]

        self.assertEqual(
            len(results),
            0,
        )

    def test_toggle_requires_authentication(self):
        self.client.force_authenticate(
            user=None
        )

        response = self.client.post(
            "/api/users/favorites/toggle/",
            {"anime_id": 1},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            401,
        )

        self.assertFalse(
            FavoriteAnime.objects.filter(
                anime=self.anime,
            ).exists()
        )