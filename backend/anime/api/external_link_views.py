from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.external_link_service import ExternalLinkService


external_link_service = ExternalLinkService()


@extend_schema(
    summary="Anime External Links",
    description="Return official and streaming links for one anime.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_external_links(request, anime_id):
    return Response(external_link_service.get_links(anime_id))
