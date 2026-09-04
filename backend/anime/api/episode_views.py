from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.episode_service import EpisodeService


episode_service = EpisodeService()


@extend_schema(
    summary="Anime Episodes",
    description="Return paginated episode information for one anime.",
    parameters=[
        OpenApiParameter(
            "page",
            OpenApiTypes.INT,
            OpenApiParameter.QUERY,
            description="Episode page number",
        ),
    ],
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_episodes(request, anime_id):
    try:
        page = max(1, int(request.GET.get("page", 1)))
    except (TypeError, ValueError):
        page = 1

    return Response(
        episode_service.get_episodes(anime_id, page)
    )
