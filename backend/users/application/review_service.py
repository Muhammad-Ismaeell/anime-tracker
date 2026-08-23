from django.db import transaction
from django.db.models import Avg

from anime.infrastructure.repositories.anime_repository import (
    AnimeRepository
)

from core.exceptions.custom_exceptions import (
    NotFoundException,
    ValidationException,
)

from users.infrastructure.models import Review


class ReviewService:

    @staticmethod
    def validate_rating(rating):
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            raise ValidationException(
                "Rating must be an integer."
            )

        if not 1 <= rating <= 10:
            raise ValidationException(
                "Rating must be between 1 and 10."
            )

        return rating

    @staticmethod
    def get_user_review(user, review_id):
        review = (
            Review.objects
            .filter(
                id=review_id,
                user=user,
            )
            .select_related("anime")
            .first()
        )

        if not review:
            raise NotFoundException(
                "Review not found."
            )

        return review

    @staticmethod
    def get_anime(anime_id):
        anime = AnimeRepository.get_by_mal_id(
            anime_id
        )

        if not anime:
            raise NotFoundException(
                "Anime not found."
            )

        return anime

    @transaction.atomic
    def create_or_update(
        self,
        user,
        anime_id,
        rating,
        text="",
    ):
        anime = self.get_anime(anime_id)

        text = (text or "").strip()

        review, _ = (
            Review.objects.update_or_create(
                user=user,
                anime=anime,
                defaults={
                    "rating": self.validate_rating(
                        rating
                    ),
                    "text": text,
                },
            )
        )

        return review

    @transaction.atomic
    def update_review(
        self,
        user,
        review_id,
        rating=None,
        text=None,
    ):
        review = self.get_user_review(
            user,
            review_id,
        )

        if rating is not None:
            review.rating = self.validate_rating(
                rating
            )

        if text is not None:
            review.text = text.strip()

        review.save()

        return review

    @transaction.atomic
    def delete_review(
        self,
        user,
        review_id,
    ):
        review = self.get_user_review(
            user,
            review_id,
        )

        review.delete()

    def get_anime_reviews(self, anime_id):
        anime = self.get_anime(anime_id)

        reviews = (
            Review.objects
            .filter(anime=anime)
            .select_related("user")
            .order_by("-created_at")
        )

        average = (
            reviews.aggregate(
                average_rating=Avg("rating")
            )["average_rating"]
            or 0
        )

        return {
            "reviews": reviews,
            "average": round(average, 1),
            "count": reviews.count(),
        }

    def get_user_reviews(self, user):
        return (
            Review.objects
            .filter(user=user)
            .select_related("anime")
            .order_by("-created_at")
        )

    def get_review_analytics(self, user):
        reviews = Review.objects.filter(
            user=user
        )

        average = (
            reviews.aggregate(
                average_rating=Avg("rating")
            )["average_rating"]
            or 0
        )

        highest = (
            reviews
            .select_related("anime")
            .order_by("-rating")
            .first()
        )

        return {
            "review_count": reviews.count(),
            "average_rating": round(average, 1),
            "highest_rating": (
                highest.rating
                if highest
                else 0
            ),
        }

    def get_top_rated(self, user, limit=5):
        reviews = (
            Review.objects
            .filter(user=user)
            .select_related("anime")
            .order_by("-rating")[:limit]
        )

        return [
            {
                "anime_id": review.anime.mal_id,
                "title": review.anime.title,
                "image": review.anime.image,
                "rating": review.rating,
            }
            for review in reviews
        ]