from django.utils import timezone

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
        """Return the actual anime season for today's calendar date."""
        today = timezone.localdate()

        if today.month <= 3:
            season = "winter"
        elif today.month <= 6:
            season = "spring"
        elif today.month <= 9:
            season = "summer"
        else:
            season = "fall"

        return today.year, season

    @classmethod
    def get_seasonal(cls, page=1):

        year, season = cls.get_current_season()

        # Prefer the most popular shows within the actual current season.
        # This prevents obscure high-scoring titles from dominating the
        # Home section and makes the ordering closer to an anime catalogue.
        queryset = (
            Anime.objects
            .filter(
                year=year,
                season=season,
                popularity__isnull=False,
            )
            .order_by(
                "popularity",
                "-score",
                "mal_id",
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

    @classmethod
    def get_recently_added(cls, page=1):

        queryset = (
            Anime.objects
            .order_by(
                "-created_at",
                "-id",
            )
        )

        return cls.paginate(
            queryset,
            page,
        )
