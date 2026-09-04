from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.character_service import CharacterService


character_service = CharacterService()


@extend_schema(
    summary="Anime Characters",
    description="Return characters and voice actors for one anime.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_characters(request, anime_id):
    return Response({
        "items": character_service.get_characters(anime_id),
    })
