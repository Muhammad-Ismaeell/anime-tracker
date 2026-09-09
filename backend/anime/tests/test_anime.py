from rest_framework.test import APITestCase

from anime.infrastructure.models import Anime


class AnimeTests(APITestCase):

    def setUp(self):
        Anime.objects.create(
            mal_id=1,
            title="Naruto",
            search_title="naruto",
            score=8.5,
            year=2002,
            status="Finished Airing",
        )
        Anime.objects.create(
            mal_id=2,
            title="One Piece",
            search_title="one piece",
            score=9.0,
            year=1999,
            status="Currently Airing",
        )
        Anime.objects.create(
            mal_id=3,
            title="Future Anime",
            search_title="future anime",
            score=7.5,
            year=2027,
            status="Not yet aired",
        )

    def test_search_anime(self):
        response = self.client.get(
            "/api/anime/search/?q=naruto"
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertEqual(
            len(response.data["data"]["items"]),
            1
        )

    def test_search_filter_year(self):
        response = self.client.get(
            "/api/anime/search/?year=2002"
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.assertEqual(
            len(response.data["data"]["items"]),
            1
        )

    def test_search_filter_airing_status(self):
        response = self.client.get(
            "/api/anime/search/?status=airing"
        )

        self.assertEqual(
            response.status_code,
            200
        )
        self.assertEqual(
            response.data["data"]["items"][0]["title"],
            "One Piece"
        )

    def test_search_filter_complete_status(self):
        response = self.client.get(
            "/api/anime/search/?status=complete"
        )

        self.assertEqual(
            response.status_code,
            200
        )
        self.assertEqual(
            response.data["data"]["items"][0]["title"],
            "Naruto"
        )

    def test_search_filter_upcoming_status(self):
        response = self.client.get(
            "/api/anime/search/?status=upcoming"
        )

        self.assertEqual(
            response.status_code,
            200
        )
        self.assertEqual(
            response.data["data"]["items"][0]["title"],
            "Future Anime"
        )
