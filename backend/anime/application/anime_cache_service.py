from anime.infrastructure.models import Anime
from anime.infrastructure.jikan.jikan_client import JikanClient


class AnimeCacheService:


    @staticmethod
    def get_or_create_anime(anime_id):

        anime = Anime.objects.filter(
            mal_id=anime_id
        ).first()


        if anime:

            return {
                "mal_id": anime.mal_id,
                "title": anime.title,
                "image": anime.image,
                "image_large": anime.image_large,
                "synopsis": anime.synopsis,
                "score": anime.score,
                "episodes": anime.episodes,
                "year": anime.year,
                "type": anime.type,
                "season": anime.season,
            }


        data = JikanClient().get_detail(
            anime_id
        )


        if not data:
            return None


        anime = Anime.objects.create(

            mal_id=anime_id,

            title=data.get(
                "title"
            ),

            image=data.get(
                "images",
                {}
            )
            .get("jpg", {})
            .get("image_url"),

            synopsis=data.get(
                "synopsis"
            ),

            score=data.get(
                "score"
            ),

            episodes=data.get(
                "episodes"
            ),

            year=data.get(
                "year"
            )
        )


        return anime