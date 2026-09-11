from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.api.docs import (
    AnimeDetailResponseSerializer,
    AnimeListResponseSerializer,
    AnimeSearchResponseSerializer,
)
from anime.application.anime_service import AnimeService
from anime.application.database_anime_service import DatabaseAnimeService
from anime.application.search_service import AnimeSearchService
from anime.infrastructure.tenrai.tenrai_client import TenraiClient


search_service = AnimeSearchService()
anime_service = AnimeService(TenraiClient())


def safe_int(value, default=1):
    try:
        return max(1, int(value))
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
    responses={200: AnimeListResponseSerializer},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def top_anime(request):
    return Response(
        DatabaseAnimeService.get_top(safe_int(request.GET.get("page")))
    )


@extend_schema(
    summary="Trending Anime",
    description="Return popular anime ordered by source popularity rank.",
    parameters=[
        OpenApiParameter(
            "page",
            OpenApiTypes.INT,
            OpenApiParameter.QUERY,
            description="Page number",
        ),
    ],
    responses={200: AnimeListResponseSerializer},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def trending_anime(request):
    return Response(
        DatabaseAnimeService.get_trending(safe_int(request.GET.get("page")))
    )


@extend_schema(
    summary="Seasonal Anime",
    description="Return anime from the current calendar anime season.",
    parameters=[
        OpenApiParameter(
            "page",
            OpenApiTypes.INT,
            OpenApiParameter.QUERY,
            description="Page number",
        ),
    ],
    responses={200: AnimeListResponseSerializer},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def seasonal_anime(request):
    return Response(
        DatabaseAnimeService.get_seasonal(safe_int(request.GET.get("page")))
    )


@extend_schema(
    summary="Recently Added Anime",
    description="Return anime ordered by when they were first added to the local catalog.",
    parameters=[
        OpenApiParameter(
            "page",
            OpenApiTypes.INT,
            OpenApiParameter.QUERY,
            description="Page number",
        ),
    ],
    responses={200: AnimeListResponseSerializer},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def recently_added_anime(request):
    return Response(
        DatabaseAnimeService.get_recently_added(
            safe_int(request.GET.get("page"))
        )
    )


@extend_schema(
    summary="Search Anime",
    parameters=[
        OpenApiParameter("q", OpenApiTypes.STR, OpenApiParameter.QUERY),
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
    responses={200: AnimeSearchResponseSerializer},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_search(request):
    query = request.GET.get("q", "").strip()
    page = safe_int(request.GET.get("page"))

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

    return Response({
        "success": True,
        "data": search_service.search(query, page, filters),
    })


@extend_schema(
    summary="Anime Detail",
    description="Return detailed information for one anime.",
    responses={200: AnimeDetailResponseSerializer},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_detail(request, anime_id):
    return Response(anime_service.get_detail(anime_id))
