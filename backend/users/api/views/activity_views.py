from rest_framework.decorators import (
    api_view,
    permission_classes,
    parser_classes,
)
from rest_framework.permissions import IsAuthenticated
from users.infrastructure.models import Activity
from core.pagination import StandardPagination
class ActivityPagination(StandardPagination):
    page_size = 20
from users.api.serializers import ActivitySerializer

from drf_spectacular.utils import extend_schema

from users.api.docs.activity_docs import ActivityResponseSerializer


@extend_schema(
    summary="Activity Feed",
    description="Return authenticated user's recent activity.",
    responses={
        200: ActivityResponseSerializer
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def activity_feed(request):

    activities = (
        Activity.objects
        .filter(user=request.user)
        .select_related("anime")
        .order_by("-created_at")
    )

    paginator = ActivityPagination()

    page = paginator.paginate_queryset(
        activities,
        request
    )

    serializer = ActivitySerializer(
        page,
        many=True
    )

    return paginator.get_paginated_response(
        serializer.data
    )