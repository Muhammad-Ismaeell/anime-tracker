from django.db.models import Max

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

    @classmethod
    def get_seasonal(cls, page=1):

        # Find the year/season that was synchronized most recently.
        latest = (
            Anime.objects
            .exclude(
                year__isnull=True,
                season__isnull=True,
            )
            .values(
                "year",
                "season",
            )
            .annotate(
                latest_sync=Max("last_synced")
            )
            .order_by("-latest_sync")
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
            .order_by(
                "-score",
                "-id",
            )
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