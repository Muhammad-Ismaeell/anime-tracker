
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated

from core.pagination import StandardPagination
from core.responses import APIResponse

from users.api.docs.favorite_docs import (
    FavoriteListResponseSerializer,
    ToggleFavoriteRequestSerializer,
    ToggleFavoriteResponseSerializer,
)
from users.api.serializers import FavoriteSerializer
from users.application.favorite_service import FavoriteService
from users.infrastructure.models import FavoriteAnime

favorite_service = FavoriteService()


class FavoritePagination(StandardPagination):
    page_size = 12


@extend_schema(
    summary="List Favorites",
    description="Return the authenticated user's favorite anime list.",
    responses={
        200: FavoriteListResponseSerializer,
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def favorite_list(request):

    queryset = (
        FavoriteAnime.objects
        .filter(user=request.user)
        .select_related("anime")
        .order_by("-created_at")
    )

    paginator = FavoritePagination()

    page = paginator.paginate_queryset(
        queryset,
        request,
    )

    serializer = FavoriteSerializer(
        page,
        many=True,
    )

    return paginator.get_paginated_response(
        serializer.data
    )


@extend_schema(
    summary="Toggle Favorite",
    description="""
Add or remove an anime from the user's favorites.

If the anime is already favorited it will be removed.
Otherwise it will be added.
""",
    request=ToggleFavoriteRequestSerializer,
    responses={
        200: ToggleFavoriteResponseSerializer,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_favorite(request):

    anime_id = request.data.get("anime_id")
    title = request.data.get("title")
    image = request.data.get("image")

    if not anime_id:
        return APIResponse.error(
            "anime_id required"
        )

    result = favorite_service.toggle(
        request.user,
        anime_id,
        title,
        image,
    )

    return APIResponse.success(
        result,
        "Favorite updated",
    )


@extend_schema(
    summary="List Favorite Anime IDs",
    description="Return all anime IDs favorited by the authenticated user.",
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def favorite_ids(request):

    ids = list(
        FavoriteAnime.objects
        .filter(user=request.user)
        .values_list(
            "anime__mal_id",
            flat=True,
        )
    )

    return APIResponse.success(
        ids,
        "Favorite IDs retrieved",
    )
