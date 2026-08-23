from anime.infrastructure.models import Anime
from datetime import datetime


from django.db.models import Case, When, IntegerField


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

        now = datetime.now()

        month = now.month


        if month in [12,1,2]:
            season = "winter"

        elif month in [3,4,5]:
            season = "spring"

        elif month in [6,7,8]:
            season = "summer"

        else:
            season = "fall"


        queryset = (
            Anime.objects
            .filter(
                season__isnull=False,
                year__isnull=False,
            )
            .annotate(
                season_order=Case(
                    When(season="winter", then=1),
                    When(season="spring", then=2),
                    When(season="summer", then=3),
                    When(season="fall", then=4),
                    output_field=IntegerField(),
                )
            )
            .order_by(
                "-year",
                "season_order",
                "-score",
            )
        )


        return cls.paginate(
            queryset,
            page
        )

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