from rest_framework.test import APITestCase

from django.contrib.auth import get_user_model

from anime.infrastructure.models import Anime
from users.infrastructure.models import UserAnimeStatus


User = get_user_model()


class LibraryTests(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            username="john",
            password="password123"
        )

        self.anime = Anime.objects.create(
            mal_id=1,
            title="Naruto"
        )

        self.client.force_authenticate(
            self.user
        )


    def test_add_anime_to_library(self):

        response = self.client.post(
            "/api/users/library/update/",
            {
                "anime_id": 1,
                "status": "watching",
                "progress": 5
            },
            format="json"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        library = UserAnimeStatus.objects.get(
            user=self.user,
            anime=self.anime
        )


        self.assertEqual(
            library.status,
            "watching"
        )

        self.assertEqual(
            library.progress,
            5
        )


    def test_update_progress(self):

        UserAnimeStatus.objects.create(
            user=self.user,
            anime=self.anime,
            status="watching",
            progress=1
        )


        response = self.client.post(
            "/api/users/library/update/",
            {
                "anime_id":1,
                "status":"watching",
                "progress":10
            },
            format="json"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        obj = UserAnimeStatus.objects.get(
            user=self.user,
            anime=self.anime
        )


        self.assertEqual(
            obj.progress,
            10
        )


    def test_remove_from_library(self):

        UserAnimeStatus.objects.create(
            user=self.user,
            anime=self.anime,
            status="watching"
        )


        response = self.client.delete(
            "/api/users/library/1/"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        exists = UserAnimeStatus.objects.filter(
            user=self.user,
            anime=self.anime
        ).exists()


        self.assertFalse(
            exists
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
            401
        )