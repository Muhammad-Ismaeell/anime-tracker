from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from anime.application.staff_service import StaffService


staff_service = StaffService()


@extend_schema(
    summary="Anime Staff",
    description="Return staff members and their positions for one anime.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def anime_staff(request, anime_id):
    return Response({
        "items": staff_service.get_staff(anime_id),
    })
