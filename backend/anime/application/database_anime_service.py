from datetime import datetime

from anime.infrastructure.models import Anime


class DatabaseAnimeService:

    DEFAULT_PAGE_SIZE = 24

    @staticmethod
    def paginate(queryset, page=1, size=DEFAULT_PAGE_SIZE):
        start = (page - 1) * size
        end = start + size

        total = queryset.count()

        return {
            "items": list(queryset[start:end].values()),
            "page": page,
            "has_next": end < total,
        }

    @staticmethod
    def get_current_season():
        month = datetime.now().month

        if month in (12, 1, 2):
            return "winter"
        elif month in (3, 4, 5):
            return "spring"
        elif month in (6, 7, 8):
            return "summer"
        else:
            return "fall"

    @classmethod
    def get_seasonal(cls, page=1):
        now = datetime.now()

        year = now.year
        season = cls.get_current_season()

        queryset = (
            Anime.objects
            .filter(
                year=year,
                season=season,
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

        return cls.paginate(queryset, page)

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

        return cls.paginate(queryset, page)