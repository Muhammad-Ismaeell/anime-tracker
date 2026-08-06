from rest_framework.decorators import (
    api_view,
    permission_classes,
    parser_classes,
)
from drf_spectacular.utils import extend_schema

from users.api.docs.dashboard_docs import (
    DashboardResponseSerializer,
)
from rest_framework.permissions import IsAuthenticated
from core.responses import APIResponse
from users.application.stats_service import StatsService
stats_service = StatsService()


@extend_schema(
    summary="User Dashboard",
    description="""
Return dashboard statistics for the authenticated user.

Includes:
- Current watching anime count
- Completed anime count
- Plan to watch count
- Dropped anime count
- Total library items
- Favorite anime count
""",
    responses={
        200: DashboardResponseSerializer
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):

    return APIResponse.success(
        stats_service.get_dashboard(
            request.user
        )
    )
