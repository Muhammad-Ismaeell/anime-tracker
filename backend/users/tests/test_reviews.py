from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from anime.infrastructure.models import Anime
from users.infrastructure.models import Review


User = get_user_model()


class ReviewTests(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

        self.client.force_authenticate(
            user=self.user
        )


        self.anime = Anime.objects.create(
            mal_id=1,
            title="Naruto",
            image="https://image.com/naruto.jpg"
        )


    def test_create_review(self):

        response = self.client.post(
            "/api/users/reviews/",
            {
                "anime_id": 1,
                "rating": 9,
                "text": "Amazing anime"
            },
            format="json"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        self.assertEqual(
            Review.objects.count(),
            1
        )


        review = Review.objects.first()

        self.assertEqual(
            review.rating,
            9
        )


    def test_update_review(self):

        review = Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=7,
            text="Good"
        )


        response = self.client.put(
            f"/api/users/reviews/{review.id}/update/",
            {
                "rating": 10,
                "text": "Perfect"
            },
            format="json"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        review.refresh_from_db()


        self.assertEqual(
            review.rating,
            10
        )


    def test_delete_review(self):

        review = Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=8,
            text="Nice"
        )


        response = self.client.delete(
            f"/api/users/reviews/{review.id}/delete/"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        self.assertEqual(
            Review.objects.count(),
            0
        )


    def test_invalid_rating(self):

        response = self.client.post(
            "/api/users/reviews/",
            {
                "anime_id": 1,
                "rating": 20,
                "text": "bad"
            },
            format="json"
        )


        self.assertEqual(
            response.status_code,
            400
        )


    def test_get_anime_reviews(self):

        Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=8,
            text="Good"
        )


        response = self.client.get(
            "/api/users/reviews/1/"
        )


        self.assertEqual(
            response.status_code,
            200
        )


        self.assertEqual(
            response.data["data"]["average_rating"],
            8
        )