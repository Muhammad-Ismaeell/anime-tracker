from core.exceptions.custom_exceptions import NotFoundException

from anime.infrastructure.models import Anime, Genre
from anime.infrastructure.jikan.jikan_client import is_nsfw
from anime.presentation.normalizer import normalize_anime_detail


class AnimeService:

    def __init__(self, client):
        self.client = client

    def save_anime(self, data):

        if not data:
            raise ValueError(
                "Anime data is empty."
            )

        # ==========================================
        # NSFW FILTER
        # ==========================================

        if is_nsfw(data):
            raise ValueError(
                "Anime blocked by NSFW filter."
            )

        mal_id = data.get("mal_id")

        if not mal_id:
            raise ValueError(
                "Anime does not have a MAL ID."
            )

        # ==========================================
        # ANIME
        # ==========================================

        anime, created = Anime.objects.update_or_create(
            mal_id=mal_id,

            defaults={
                "title": data.get(
                    "title",
                    "",
                ),

                "title_english": (
                    data.get("title_english")
                    or data.get("title")
                ),

                "search_title": (
                    data.get(
                        "title",
                        "",
                    ).lower()
                ),

                "image": (
                    data.get(
                        "images",
                        {}
                    )
                    .get(
                        "jpg",
                        {}
                    )
                    .get(
                        "image_url"
                    )
                ),

                "image_large": (
                    data.get(
                        "images",
                        {}
                    )
                    .get(
                        "jpg",
                        {}
                    )
                    .get(
                        "large_image_url"
                    )
                ),

                "synopsis": data.get(
                    "synopsis"
                ),

                "score": data.get(
                    "score"
                ),

                "popularity": data.get(
                    "popularity"
                ),

                "type": data.get(
                    "type"
                ),

                "episodes": data.get(
                    "episodes"
                ),

                "year": data.get(
                    "year"
                ),

                "season": data.get(
                    "season"
                ),

                "status": data.get(
                    "status"
                ),

                "rating": (
                    data.get("rating")
                    or "Unknown"
                ),
            }
        )

        # ==========================================
        # GENRES
        # ==========================================

        genres = []

        for genre_data in data.get(
            "genres",
            [],
        ):

            genre_mal_id = genre_data.get(
                "mal_id"
            )

            name = genre_data.get(
                "name"
            )

            if not genre_mal_id or not name:
                continue

            genre, _ = Genre.objects.get_or_create(
                mal_id=genre_mal_id,

                defaults={
                    "name": name,
                },
            )

            genres.append(genre)

        anime.genres.set(genres)

        return anime, created

    # ==============================================
    # GET OR CREATE
    # ==============================================

    def get_or_create(self, anime_id):

        anime = Anime.objects.filter(
            mal_id=anime_id
        ).first()

        # If the anime already exists and has its
        # episode metadata, use the cached record.
        if anime and anime.episodes is not None:
            return anime

        # Existing record is incomplete, so refresh it.
        raw = self.client.get_detail(
            anime_id
        )

        if not raw:

            if not anime:
                raise NotFoundException(
                    "Anime not found"
                )

            raise NotFoundException(
                "Anime metadata could not be refreshed"
            )

        anime, _ = self.save_anime(
            raw
        )

        return anime

    # ==============================================
    # DETAIL
    # ==============================================

    def get_detail(self, anime_id):

        anime = self.get_or_create(
            anime_id
        )

        return {
            "item": normalize_anime_detail(
                anime
            )
        }