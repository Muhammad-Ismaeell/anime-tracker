from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.infrastructure.jikan.jikan_client import JikanClient
import json

from django.conf import settings
from django.db import transaction

from anime.infrastructure.models import Anime
from anime.infrastructure.jikan.jikan_client import is_nsfw
from anime.application.search_service import AnimeSearchService
from anime.application.anime_service import AnimeService
from anime.application.database_anime_service import DatabaseAnimeService
from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
    OpenApiTypes,
)

from anime.api.docs import (
    AnimeListResponseSerializer,
    AnimeSearchResponseSerializer,
    AnimeDetailResponseSerializer,
)

search_service = AnimeSearchService()

anime_service = AnimeService(
    JikanClient()
)


def safe_int(value, default=1):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


@extend_schema(
    summary="Top Anime",
    description="Return top rated anime.",
    parameters=[
        OpenApiParameter(
            "page",
            OpenApiTypes.INT,
            OpenApiParameter.QUERY,
            description="Page number",
        ),
    ],
    responses={
        200: AnimeListResponseSerializer
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def top_anime(request):

    page = safe_int(
        request.GET.get("page")
    )

    return Response(
        DatabaseAnimeService.get_top(page)
    )


@extend_schema(
    summary="Trending Anime",
    description="Return trending anime.",
    parameters=[
        OpenApiParameter(
            "page",
            OpenApiTypes.INT,
            OpenApiParameter.QUERY,
            description="Page number",
        ),
    ],
    responses={
        200: AnimeListResponseSerializer
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def trending_anime(request):

    page = safe_int(
        request.GET.get("page")
    )

    return Response(
        DatabaseAnimeService.get_trending(page)
    )


@extend_schema(
    summary="Seasonal Anime",
    description="Return seasonal anime.",
    parameters=[
        OpenApiParameter(
            "page",
            OpenApiTypes.INT,
            OpenApiParameter.QUERY,
            description="Page number",
        ),
    ],
    responses={
        200: AnimeListResponseSerializer
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def seasonal_anime(request):

    page = safe_int(
        request.GET.get("page")
    )

    return Response(
        DatabaseAnimeService.get_seasonal(page)
    )


@extend_schema(
    summary="Search Anime",
    parameters=[
        OpenApiParameter(
            name="q",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Anime title (e.g. Naruto, One Piece)",
        ),
        OpenApiParameter("page", OpenApiTypes.INT),
        OpenApiParameter("type", OpenApiTypes.STR),
        OpenApiParameter("season", OpenApiTypes.STR),
        OpenApiParameter("year", OpenApiTypes.INT),
        OpenApiParameter("status", OpenApiTypes.STR),
        OpenApiParameter("rating", OpenApiTypes.STR),
        OpenApiParameter("genres", OpenApiTypes.STR),
        OpenApiParameter("order_by", OpenApiTypes.STR),
        OpenApiParameter("sort", OpenApiTypes.STR),
        OpenApiParameter("min_score", OpenApiTypes.FLOAT),
    ],
    responses={
        200: AnimeSearchResponseSerializer
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_search(request):

    query = request.GET.get(
        "q",
        ""
    ).strip()

    page = safe_int(
        request.GET.get("page")
    )

    filters = {
        key: value
        for key, value in {
            "type": request.GET.get("type"),
            "season": request.GET.get("season"),
            "year": request.GET.get("year"),
            "status": request.GET.get("status"),
            "rating": request.GET.get("rating"),
            "genres": request.GET.get("genres"),
            "order_by": request.GET.get("order_by"),
            "sort": request.GET.get("sort"),
            "min_score": request.GET.get("min_score"),
        }.items()
        if value
    }

    return Response(
        {
            "success": True,
            "data": search_service.search(
                query,
                page,
                filters
            )
        }
    )


@extend_schema(
    summary="Anime Detail",
    description="Return detailed information for one anime.",
    responses={
        200: AnimeDetailResponseSerializer
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_detail(request, anime_id):

    return Response(
        anime_service.get_detail(anime_id)
    )
