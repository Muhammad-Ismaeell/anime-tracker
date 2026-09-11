from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.news_service import NewsService


news_service = NewsService()


def safe_int(value, default=1):
    try:
        return max(1, int(value))
    except (TypeError, ValueError):
        return default


@extend_schema(
    summary="Anime News",
    description="Return recent anime news for general discovery.",
    parameters=[OpenApiParameter("page", OpenApiTypes.INT, OpenApiParameter.QUERY)],
)
@api_view(["GET"])
@permission_classes([AllowAny])
def general_news(request):
    return Response(
        news_service.get_general_news(
            safe_int(request.GET.get("page"))
        )
    )


@extend_schema(
    summary="Anime News",
    description="Return recent news articles for one anime.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_news(request, anime_id):
    return Response(news_service.get_news(anime_id))
