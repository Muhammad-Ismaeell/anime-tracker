from rest_framework.test import APITestCase

from anime.infrastructure.models import Anime


class AnimeTests(APITestCase):


    def setUp(self):

        Anime.objects.create(
            mal_id=1,
            title="Naruto",
            search_title="naruto",
            score=8.5,
            year=2002
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