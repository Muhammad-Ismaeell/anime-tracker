from core.exceptions.custom_exceptions import NotFoundException

from anime.infrastructure.models import Anime
from anime.presentation.normalizer import normalize_anime_detail


class AnimeService:

    def __init__(self, client):
        self.client = client

    def save_anime(self, raw):

        images = raw.get("images", {}).get("jpg", {})

        defaults = {
            "title": raw.get("title") or "",
            "title_english": raw.get("title_english") or "",
            "search_title": (raw.get("title") or "").lower(),
            "image": images.get("image_url"),
            "image_large": images.get("large_image_url"),
            "score": raw.get("score"),
            "popularity": raw.get("popularity"),
            "type": raw.get("type"),
            "episodes": raw.get("episodes"),
            "year": raw.get("year"),
            "season": raw.get("season"),
            "status": raw.get("status"),
            "rating": raw.get("rating"),
        }

        # Don't overwrite an existing synopsis with None.
        if raw.get("synopsis") is not None:
            defaults["synopsis"] = raw["synopsis"]

        anime, _ = Anime.objects.update_or_create(
            mal_id=raw["mal_id"],
            defaults=defaults,
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