from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.statistics_service import StatisticsService


statistics_service = StatisticsService()


@extend_schema(
    summary="Anime Statistics",
    description="Return viewing statistics for one anime.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_statistics(request, anime_id):
    return Response(
        statistics_service.get_statistics(anime_id)
    )
