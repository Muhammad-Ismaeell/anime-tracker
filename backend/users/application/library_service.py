from anime.infrastructure.repositories.anime_repository import AnimeRepository
from users.infrastructure.models import (
    UserAnimeStatus
)

from core.exceptions.custom_exceptions import (
    NotFoundException,
    ValidationException
)

from users.application.activity_service import ActivityService


activity_service = ActivityService()



class LibraryService:


    def get_user_library(self, user):

        return (
            UserAnimeStatus.objects
            .filter(user=user)
            .select_related("anime")
        )


    def update_status(self, user, data):

        anime_id = data.get("anime_id")

        if not anime_id:
            raise ValidationException(
                "anime_id required"
            )


        anime = AnimeRepository.get_by_mal_id(
            anime_id
        )


        # Create cache entry without blocking
        if not anime:
            anime = AnimeRepository.create_placeholder(
                mal_id=anime_id,
                title=data.get("title", "Unknown"),
                image=data.get("image"),
            )


        obj, created = UserAnimeStatus.objects.update_or_create(
            user=user,
            anime=anime,
            defaults={
                "status": data.get(
                    "status",
                    "watching"
                ),
                "progress": max(
                    0,
                    min(
                        data.get("progress",0),
                        anime.episodes or 9999
                    )
                )
            }
        )


        action_map = {
            "watching": "WATCHING",
            "completed": "COMPLETED",
            "dropped": "DROPPED",
            "plan_to_watch": "ADDED",
        }


        activity_service.create(
            user=user,
            anime=anime,
            action=action_map.get(
                obj.status,
                "ADDED"
            )
        )


        return obj



    def remove_from_library(
        self,
        user,
        anime_id
    ):

        anime = AnimeRepository.get_by_mal_id(
            anime_id
        )


        if not anime:
            raise NotFoundException(
                "anime not found"
            )


        activity_service.create(
            user=user,
            anime=anime,
            action="REMOVED"
        )


        UserAnimeStatus.objects.filter(
            user=user,
            anime=anime
        ).delete()


        return {
            "deleted": True
        }