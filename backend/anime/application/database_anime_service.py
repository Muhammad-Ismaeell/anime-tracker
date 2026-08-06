from anime.infrastructure.models import Anime


class DatabaseAnimeService:

    DEFAULT_PAGE_SIZE = 24

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

    @classmethod
    def get_top(
        cls,
        page=1,
    ):

        queryset = (
            Anime.objects
            .all()
            .order_by("-score")
        )

        return cls.paginate(
            queryset,
            page,
        )

    @classmethod
    def get_trending(
        cls,
        page=1,
    ):

        queryset = (
            Anime.objects
            .filter(
                popularity__isnull=False
            )
            .order_by("popularity")
        )

        return cls.paginate(
            queryset,
            page,
        )

    @classmethod
    def get_seasonal(
        cls,
        page=1,
    ):

        queryset = (
            Anime.objects
            .filter(
                season__isnull=False,
                year__isnull=False,
            )
            .order_by(
                "-year",
                "season",
                "-score",
            )
        )

        return cls.paginate(
            queryset,
            page,
        )