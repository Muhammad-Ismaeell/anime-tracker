from datetime import datetime

from anime.infrastructure.models import Anime
from anime.infrastructure.jikan.jikan_client import JikanClient
from anime.application.anime_service import AnimeService


class DatabaseAnimeService:

    DEFAULT_PAGE_SIZE = 24

    jikan_client = JikanClient()

    @staticmethod
    def paginate(
        queryset,
        page=1,
        size=DEFAULT_PAGE_SIZE,
    ):
        start = (page - 1) * size
        end = start + size

        total = queryset.count()

        return {
            "items": list(
                queryset[start:end].values()
            ),
            "page": page,
            "has_next": end < total,
        }

    @staticmethod
    def get_current_season():

        month = datetime.now().month

        if month in (12, 1, 2):
            return "winter"

        if month in (3, 4, 5):
            return "spring"

        if month in (6, 7, 8):
            return "summer"

        return "fall"

    @classmethod
    def populate_current_season(cls):

        client = cls.jikan_client
        service = AnimeService(client)

        page = 1
        saved = 0

        while True:

            response = client.get_seasonal(page)

            items = response.get(
                "items",
                []
            )

            if not items:
                break

            for anime in items:

                try:
                    service.save_anime(anime)
                    saved += 1

                except Exception:
                    continue

            if not response.get(
                "has_next",
                False
            ):
                break

            page += 1

        return saved

    @classmethod
    def get_seasonal(cls, page=1):

        latest = (
            Anime.objects
            .exclude(year__isnull=True)
            .exclude(season__isnull=True)
            .order_by("-year", "-id")
            .values("year", "season")
            .first()
        )

        if not latest:
            return {
                "items": [],
                "page": page,
                "has_next": False,
            }

        queryset = (
            Anime.objects
            .filter(
                year=latest["year"],
                season=latest["season"],
            )
            .order_by("-score", "-id")
        )

        return cls.paginate(
            queryset,
            page,
        )

    @classmethod
    def get_top(cls, page=1):

        queryset = (
            Anime.objects
            .filter(
                score__isnull=False,
                score__gt=0,
            )
            .order_by(
                "-score",
                "mal_id",
            )
        )

        return cls.paginate(
            queryset,
            page,
        )

    @classmethod
    def get_trending(cls, page=1):

        queryset = (
            Anime.objects
            .filter(
                popularity__isnull=False
            )
            .order_by(
                "popularity",
                "-score",
            )
        )

        return cls.paginate(
            queryset,
            page,
        )