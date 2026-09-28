from django.db import transaction

from anime.infrastructure.repositories.anime_repository import AnimeRepository
from users.application.activity_service import ActivityService
from users.infrastructure.repositories.favorite_repository import (
    FavoriteRepository,
)


activity_service = ActivityService()


class FavoriteService:

    @transaction.atomic
    def toggle(
        self,
        user,
        anime_id,
        title=None,
        image=None,
    ):
        """Add or remove an anime from the user's favorites."""

        anime = AnimeRepository.get_by_mal_id(
            anime_id
        )

        # Create a minimal local record when the anime has not been cached yet.
        if not anime:
            anime = AnimeRepository.create_placeholder(
                mal_id=anime_id,
                title=title,
                image=image,
            )

        favorite, created = (
            FavoriteRepository.get_or_create(
                user,
                anime,
            )
        )


        if not created:
            FavoriteRepository.delete(
                favorite
            )

            activity_service.create(
                user,
                anime,
                "UNFAVORITED",
            )

            return {
                "anime_id": anime.mal_id,
                "added": False,
            }


        activity_service.create(
            user,
            anime,
            "FAVORITED",
        )

        return {
            "anime_id": anime.mal_id,
            "added": True,
        }
