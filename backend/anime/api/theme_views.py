from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.theme_service import ThemeService


theme_service = ThemeService()


@extend_schema(
    summary="Anime Themes",
    description="Return opening and ending themes for one anime.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_themes(request, anime_id):
    return Response(theme_service.get_themes(anime_id))
