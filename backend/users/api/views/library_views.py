from drf_spectacular.utils import extend_schema
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated

from core.pagination import StandardPagination
from core.responses import APIResponse

from users.api.docs.library_docs import (
    LibraryStatsResponseSerializer,
    LibraryUpdateRequestSerializer,
)
from users.api.serializers import LibrarySerializer
from users.application.library_service import LibraryService
from users.application.stats_service import StatsService

stats_service = StatsService()
library_service = LibraryService()


class LibraryPagination(StandardPagination):
    page_size = 24


# ============================================================
# Library Stats
# ============================================================

@extend_schema(
    summary="Library Statistics",
    description="Return statistics about user's anime library.",
    responses={
        200: LibraryStatsResponseSerializer,
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def library_stats(request):

    return APIResponse.success(
        stats_service.get_stats(request.user),
        "Stats fetched",
    )


# ============================================================
# Library
# ============================================================

@extend_schema(
    summary="Get user library",
    description="Return authenticated user's anime library.",
    responses={
        200: LibrarySerializer(many=True),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def library(request):

    queryset = (
        library_service
        .get_user_library(request.user)
        .order_by("-updated_at")
    )

    paginator = LibraryPagination()

    page = paginator.paginate_queryset(
        queryset,
        request,
    )

    serializer = LibrarySerializer(
        page,
        many=True,
    )

    return paginator.get_paginated_response(
        serializer.data
    )


# ============================================================
# Update Library Status
# ============================================================

@extend_schema(
    request=LibraryUpdateRequestSerializer,
    responses={
        200: LibrarySerializer,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_status(request):

    anime_id = request.data.get("anime_id")
    status = request.data.get("status")
    remove = request.data.get("remove", False)

    if not anime_id:
        return APIResponse.error(
            "anime_id required"
        )

    if remove or status == "remove":

        library_service.remove_from_library(
            request.user,
            anime_id,
        )

        return APIResponse.success(
            {},
            "Removed from library",
        )

    if not status:
        return APIResponse.error(
            "status required"
        )

    item = library_service.update_status(
        request.user,
        {
            "anime_id": anime_id,
            "status": status,
            "progress": request.data.get("progress", 0),
            "title": request.data.get("title"),
            "image": request.data.get("image"),
        },
    )

    return APIResponse.success(
        LibrarySerializer(item).data,
        "Updated",
    )


# ============================================================
# Remove From Library
# ============================================================

@extend_schema(
    summary="Remove Anime From Library",
    description="Remove an anime from the authenticated user's library.",
    responses={
        200: None,
    },
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_from_library(
    request,
    anime_id,
):

    library_service.remove_from_library(
        request.user,
        anime_id,
    )

    return APIResponse.success(
        {},
        "Removed from library",
    )