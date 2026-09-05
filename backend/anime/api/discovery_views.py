from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.character_service import CharacterService
from anime.application.news_service import NewsService
from anime.application.recommendation_service import RecommendationService


character_service = CharacterService()
news_service = NewsService()
recommendation_service = RecommendationService()


def safe_int(value, default=1):
    try:
        return max(1, int(value))
    except (TypeError, ValueError):
        return default


@extend_schema(
    summary="General Anime Recommendations",
    description="Return general anime recommendations for discovery.",
    parameters=[OpenApiParameter("page", OpenApiTypes.INT, OpenApiParameter.QUERY)],
)
@api_view(["GET"])
@permission_classes([AllowAny])
def general_recommendations(request):
    return Response(recommendation_service.get_general_recommendations(safe_int(request.GET.get("page"))))


@extend_schema(
    summary="Anime Characters",
    description="Return characters for general discovery.",
    parameters=[
        OpenApiParameter("page", OpenApiTypes.INT, OpenApiParameter.QUERY),
        OpenApiParameter("q", OpenApiTypes.STR, OpenApiParameter.QUERY),
        OpenApiParameter("order_by", OpenApiTypes.STR, OpenApiParameter.QUERY),
        OpenApiParameter("sort", OpenApiTypes.STR, OpenApiParameter.QUERY),
        OpenApiParameter("letter", OpenApiTypes.STR, OpenApiParameter.QUERY),
    ],
)
@api_view(["GET"])
@permission_classes([AllowAny])
def general_characters(request):
    return Response(
        character_service.get_general_characters(
            page=safe_int(request.GET.get("page")),
            query=request.GET.get("q", "").strip(),
            order_by=request.GET.get("order_by", "favorites"),
            sort=request.GET.get("sort", "desc"),
            letter=request.GET.get("letter", "").strip()[:1],
        )
    )


@extend_schema(
    summary="Anime News",
    description="Return recent anime news for general discovery.",
    parameters=[
        OpenApiParameter("page", OpenApiTypes.INT, OpenApiParameter.QUERY),
        OpenApiParameter("q", OpenApiTypes.STR, OpenApiParameter.QUERY),
        OpenApiParameter("tag", OpenApiTypes.STR, OpenApiParameter.QUERY),
    ],
)
@api_view(["GET"])
@permission_classes([AllowAny])
def general_news(request):
    return Response(
        news_service.get_general_news(
            page=safe_int(request.GET.get("page")),
            query=request.GET.get("q", "").strip(),
            tag=request.GET.get("tag", "").strip(),
        )
    )
