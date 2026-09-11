from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.recommendation_service import RecommendationService


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
    return Response(
        recommendation_service.get_general_recommendations(
            safe_int(request.GET.get("page"))
        )
    )


@extend_schema(
    summary="Anime Recommendations",
    description="Return SFW anime recommendations for one anime.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_recommendations(request, anime_id):
    return Response(
        {
            "items": recommendation_service.get_recommendations(anime_id),
        }
    )
