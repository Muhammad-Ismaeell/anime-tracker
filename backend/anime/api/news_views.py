from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.news_service import NewsService


news_service = NewsService()


@extend_schema(
    summary="Anime News",
    description="Return recent news articles for one anime.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_news(request, anime_id):
    return Response(news_service.get_news(anime_id))
