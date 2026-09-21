from django.utils import timezone

from core.exceptions.custom_exceptions import NotFoundException

from anime.infrastructure.models import Anime, Genre
from anime.infrastructure.tenrai.tenrai_client import is_nsfw
from anime.presentation.normalizer import normalize_anime_detail


class AnimeService:
    def __init__(self, client):
        self.client = client

    def save_anime(self, data):
        if not data:
            raise ValueError("Anime data is empty.")

        if is_nsfw(data):
            raise ValueError("Anime blocked by NSFW filter.")

        mal_id = data.get("mal_id")
        if not mal_id:
            raise ValueError("Anime does not have a MAL ID.")

        existing = Anime.objects.filter(mal_id=mal_id).first()

        episodes = data.get("episodes")
        if episodes is None and existing:
            episodes = existing.episodes

        year = data.get("year")
        if year is None and existing:
            year = existing.year

        season = data.get("season")
        if season is None and existing:
            season = existing.season

        status = data.get("status")
        if not status and existing:
            status = existing.status

        trailer = data.get("trailer") or {}
        trailer_embed_url = trailer.get("embed_url") or (
            existing.trailer_embed_url if existing else ""
        )

        defaults = {
                "title": data.get("title", ""),
                "title_english": data.get("title_english") or data.get("title"),
                "search_title": data.get("title", "").lower(),
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
                "episodes": episodes,
                "year": year,
                "season": season,
                "status": status,
                "rating": (
                    data.get("rating")
                    or (existing.rating if existing else "Unknown")
                    or "Unknown"
                ),
            "trailer_embed_url": trailer_embed_url,
        }

        if "trailer" in data:
            defaults["trailer_checked_at"] = timezone.now()

        anime, created = Anime.objects.update_or_create(
            mal_id=mal_id,
            defaults=defaults,
        )

        genres = []
        for genre_data in data.get("genres", []):
            genre_mal_id = genre_data.get("mal_id")
            name = genre_data.get("name")
            if not genre_mal_id or not name:
                continue

            genre, _ = Genre.objects.get_or_create(
                mal_id=genre_mal_id,
                defaults={"name": name},
            )
            genres.append(genre)

        if genres:
            anime.genres.set(genres)

        return anime, created

    def get_or_create(self, anime_id):
        anime = Anime.objects.filter(mal_id=anime_id).first()

        if (
            anime
            and anime.episodes is not None
            and anime.trailer_checked_at is not None
        ):
            return anime

        raw = self.client.get_detail(anime_id)
        if not raw:
            if not anime:
                raise NotFoundException("Anime not found")
            raise NotFoundException("Anime metadata could not be refreshed")

        anime, _ = self.save_anime(raw)
        return anime

    def get_detail(self, anime_id):
        anime = self.get_or_create(anime_id)
        return {"item": normalize_anime_detail(anime)}
