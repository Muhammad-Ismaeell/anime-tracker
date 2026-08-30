from django.db.models import Q

from anime.infrastructure.models import Anime
from anime.api.serializers import AnimeSerializer
PAGE_SIZE = 24

ALLOWED_ORDERING = {
    "score",
    "year",
    "popularity",
    "title",
}


class AnimeSearchService:
    @staticmethod
    def search(query="", page=1, filters=None):
        filters = filters or {}

        queryset = Anime.objects.all()

        # --------------------
        # TEXT SEARCH
        # --------------------

        if query:

            query = query.lower()

            queryset = queryset.filter(
                Q(search_title__icontains=query)
                |
                Q(title__icontains=query)
                |
                Q(title_english__icontains=query)
            )

        # --------------------
        # FILTERS
        # --------------------

        if value := filters.get("type"):
            queryset = queryset.filter(
                type__iexact=value
            )

        if value := filters.get("year"):
            queryset = queryset.filter(year=value)

        if value := filters.get("season"):
            queryset = queryset.filter(
                season__iexact=value
            )

        if value := filters.get("min_score"):
            queryset = queryset.filter(score__gte=value)

        if value := filters.get("status"):
            queryset = queryset.filter(
                status__iexact=value
            )


        if value := filters.get("rating"):
            queryset = queryset.filter(
                rating__iexact=value
            )


        if value := filters.get("genres"):
            queryset = queryset.filter(
                genres__name__iexact=value
            ).distinct()

        # --------------------
        # SORTING
        # --------------------

        order_by = filters.get("order_by", "score")

        if order_by not in ALLOWED_ORDERING:
            order_by = "score"

        if filters.get("sort", "desc") == "desc":
            order_by = f"-{order_by}"

        queryset = queryset.order_by(order_by)

        # --------------------
        # PAGINATION
        # --------------------

        total = queryset.count()

        start = (page - 1) * PAGE_SIZE
        end = start + PAGE_SIZE


        items = AnimeSerializer(
            queryset[start:end],
            many=True
        ).data


        return {
            "items": items,
            "page": page,
            "has_next": end < total,
            "total": total,
        }