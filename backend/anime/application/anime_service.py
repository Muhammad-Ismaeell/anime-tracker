from core.exceptions.custom_exceptions import NotFoundException

from anime.infrastructure.models import Anime, Genre
from anime.presentation.normalizer import normalize_anime_detail


class AnimeService:

    def __init__(self, client):
        self.client = client

    def save_anime(self, data):

        anime, created = Anime.objects.update_or_create(
            mal_id=data.get("mal_id"),
            defaults={
                "title": data.get("title", ""),
                "title_english": data.get("title_english") or data.get("title"),

                "image": (
                    data.get("images", {})
                    .get("jpg", {})
                    .get("image_url")
                ),

                "image_large": (
                    data.get("images", {})
                    .get("jpg", {})
                    .get("large_image_url")
                ),

                "synopsis": data.get("synopsis"),

                "score": data.get("score"),

                "popularity": data.get("popularity"),

                "type": data.get("type"),

                "episodes": data.get("episodes"),

                "year": data.get("year"),

                "season": data.get("season"),

                "status": data.get("status"),

                "rating": data.get("rating") or "Unknown",
            }
        )

        return anime

    def get_or_create(self, anime_id):

        anime = Anime.objects.filter(
            mal_id=anime_id
        ).first()

        if anime:
            return anime

        raw = self.client.get_detail(anime_id)

        if not raw:
            raise NotFoundException("Anime not found")

        return self.save_anime(raw)

    def get_detail(self, anime_id):

        anime = self.get_or_create(anime_id)

        return {
            "item": normalize_anime_detail(anime)
        }