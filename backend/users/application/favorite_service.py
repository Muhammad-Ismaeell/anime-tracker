from anime.infrastructure.repositories.anime_repository import AnimeRepository
from users.infrastructure.repositories.favorite_repository import FavoriteRepository
from users.application.activity_service import ActivityService


activity_service = ActivityService()



class FavoriteService:


    def toggle(
        self,
        user,
        anime_id
    ):

        anime = AnimeRepository.get_by_mal_id(
            anime_id
        )


        if not anime:

            anime = AnimeRepository.create_placeholder(
                anime_id
            )


        favorite, created = FavoriteRepository.get_or_create(
            user,
            anime,
        )


        if not created:

            FavoriteRepository.delete(
                favorite
            )


            activity_service.create(
                user,
                anime,
                "UNFAVORITED"
            )


            return {
                "anime_id": anime.mal_id,
                "added": False
            }



        activity_service.create(
            user,
            anime,
            "FAVORITED"
        )


        return {
            "anime_id": anime.mal_id,
            "added": True
        }