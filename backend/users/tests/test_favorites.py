from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from anime.infrastructure.models import Anime


User=get_user_model()



class FavoriteTests(APITestCase):


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


    def test_add_favorite(self):

        response = self.client.post(
            "/api/users/favorites/toggle/",
            {
                "anime_id":1
            }
        )


        self.assertEqual(
            response.status_code,
            200
        )


        self.assertTrue(
            response.data["data"]["added"]
        )



    def test_remove_favorite(self):

        self.client.post(
            "/api/users/favorites/toggle/",
            {
                "anime_id":1
            }
        )


        response=self.client.post(
            "/api/users/favorites/toggle/",
            {
                "anime_id":1
            }
        )


        self.assertFalse(
            response.data["data"]["added"]
        )