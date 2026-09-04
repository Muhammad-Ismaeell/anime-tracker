from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.relation_service import RelationService


relation_service = RelationService()


@extend_schema(
    summary="Anime Relations",
    description="Return related anime entries grouped by relation type.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_relations(request, anime_id):
    return Response({
        "items": relation_service.get_relations(anime_id),
    })
