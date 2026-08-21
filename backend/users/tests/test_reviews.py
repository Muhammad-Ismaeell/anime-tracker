from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase

from anime.infrastructure.models import Anime
from users.infrastructure.models import Review


User = get_user_model()


class ReviewTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123",
        )

        self.other_user = User.objects.create_user(
            username="other",
            email="other@test.com",
            password="other12345",
        )

        self.anime = Anime.objects.create(
            mal_id=1,
            title="Naruto",
            image="https://image.com/naruto.jpg",
        )

        self.client.force_authenticate(
            user=self.user
        )

    def test_create_review(self):
        response = self.client.post(
            "/api/users/reviews/",
            {
                "anime_id": 1,
                "rating": 9,
                "text": "Amazing anime",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            Review.objects.count(),
            1,
        )

        review = Review.objects.first()

        self.assertEqual(
            review.user,
            self.user,
        )

        self.assertEqual(
            review.rating,
            9,
        )

        self.assertEqual(
            review.text,
            "Amazing anime",
        )

    def test_create_review_updates_existing_review(self):
        Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=7,
            text="Good",
        )

        response = self.client.post(
            "/api/users/reviews/",
            {
                "anime_id": 1,
                "rating": 10,
                "text": "Perfect",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            Review.objects.filter(
                user=self.user,
                anime=self.anime,
            ).count(),
            1,
        )

        review = Review.objects.get(
            user=self.user,
            anime=self.anime,
        )

        self.assertEqual(
            review.rating,
            10,
        )

        self.assertEqual(
            review.text,
            "Perfect",
        )

    def test_update_own_review(self):
        review = Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=7,
            text="Good",
        )

        response = self.client.put(
            f"/api/users/reviews/{review.id}/update/",
            {
                "rating": 10,
                "text": "Perfect",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        review.refresh_from_db()

        self.assertEqual(
            review.rating,
            10,
        )

        self.assertEqual(
            review.text,
            "Perfect",
        )

    def test_other_user_cannot_update_review(self):
        review = Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=8,
            text="Original",
        )

        self.client.force_authenticate(
            user=self.other_user
        )

        response = self.client.put(
            f"/api/users/reviews/{review.id}/update/",
            {
                "rating": 1,
                "text": "Changed by another user",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            404,
        )

        review.refresh_from_db()

        self.assertEqual(
            review.rating,
            8,
        )

        self.assertEqual(
            review.text,
            "Original",
        )

    def test_delete_own_review(self):
        review = Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=8,
            text="Nice",
        )

        response = self.client.delete(
            f"/api/users/reviews/{review.id}/delete/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertFalse(
            Review.objects.filter(
                id=review.id
            ).exists()
        )

    def test_other_user_cannot_delete_review(self):
        review = Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=8,
            text="Nice",
        )

        self.client.force_authenticate(
            user=self.other_user
        )

        response = self.client.delete(
            f"/api/users/reviews/{review.id}/delete/"
        )

        self.assertEqual(
            response.status_code,
            404,
        )

        self.assertTrue(
            Review.objects.filter(
                id=review.id
            ).exists()
        )

    def test_invalid_rating(self):
        response = self.client.post(
            "/api/users/reviews/",
            {
                "anime_id": 1,
                "rating": 20,
                "text": "bad",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

    def test_get_anime_reviews_as_authenticated_user(self):
        Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=8,
            text="Good",
        )

        response = self.client.get(
            "/api/users/reviews/1/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["data"]["average_rating"],
            8,
        )

        self.assertEqual(
            len(response.data["data"]["reviews"]),
            1,
        )

    def test_get_anime_reviews_as_guest(self):
        Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=8,
            text="Good",
        )

        self.client.force_authenticate(
            user=None
        )

        response = self.client.get(
            "/api/users/reviews/1/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        data = response.data["data"]

        self.assertEqual(
            data["average_rating"],
            8,
        )

        self.assertEqual(
            len(data["reviews"]),
            1,
        )

        self.assertEqual(
            data["reviews"][0]["username"],
            "testuser",
        )

    def test_reviews_are_isolated_by_anime(self):
        other_anime = Anime.objects.create(
            mal_id=2,
            title="One Piece",
        )

        Review.objects.create(
            user=self.user,
            anime=self.anime,
            rating=8,
            text="Naruto review",
        )

        Review.objects.create(
            user=self.user,
            anime=other_anime,
            rating=10,
            text="One Piece review",
        )

        self.client.force_authenticate(
            user=None
        )

        response = self.client.get(
            "/api/users/reviews/1/"
        )

        reviews = response.data["data"]["reviews"]

        self.assertEqual(
            len(reviews),
            1,
        )

        self.assertEqual(
            reviews[0]["text"],
            "Naruto review",
        )