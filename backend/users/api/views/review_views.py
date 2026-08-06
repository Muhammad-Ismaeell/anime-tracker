from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from core.responses import APIResponse
from users.application.review_service import ReviewService
from users.api.serializers.review_serializer import ReviewAnalyticsSerializer, ReviewSerializer, TopRatedAnimeSerializer
from drf_spectacular.utils import extend_schema

from users.api.docs.review_docs import (
    ReviewCreateRequestSerializer,
    ReviewUpdateRequestSerializer
)
review_service = ReviewService()


# ============================================================
# Create / Update Review
# ============================================================

@extend_schema(
    summary="Create or update review",
    description="Create a new anime review or update an existing one.",
    request=ReviewCreateRequestSerializer,
    responses={
        200: ReviewSerializer
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_review(request):

    review = review_service.create_or_update(
        user=request.user,
        anime_id=request.data.get("anime_id"),
        rating=request.data.get("rating"),
        text=request.data.get("text", ""),
    )

    return APIResponse.success(
        ReviewSerializer(review).data,
        "Review saved"
    )


# ============================================================
# Anime Reviews
# ============================================================

@extend_schema(
    summary="Get anime reviews",
    description="Return all reviews for a specific anime.",
    responses={
        200: ReviewSerializer(many=True)
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def anime_reviews(request, anime_id):

    result = review_service.get_anime_reviews(anime_id)

    return APIResponse.success(
        {
            "average_rating": result["average"],
            "reviews": ReviewSerializer(
                result["reviews"],
                many=True
            ).data,
        },
        "Reviews fetched"
    )


# ============================================================
# Delete Review
# ============================================================
@extend_schema(
    summary="Delete review",
    description="Delete a review created by the authenticated user.",
    responses={
        200: None
    }
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):

    review_service.delete_review(
        request.user,
        review_id,
    )

    return APIResponse.success(
        {},
        "Deleted"
    )


# ============================================================
# Update Review
# ============================================================
@extend_schema(
    summary="Update review",
    description="Update rating or text of an existing review.",
    request=ReviewUpdateRequestSerializer,
    responses={
        200: ReviewSerializer
    }
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_review(request, review_id):

    review = review_service.update_review(
        user=request.user,
        review_id=review_id,
        rating=request.data.get("rating"),
        text=request.data.get("text"),
    )

    return APIResponse.success(
        ReviewSerializer(review).data,
        "Review updated"
    )


# ============================================================
# My Reviews
# ============================================================
@extend_schema(
    summary="My reviews",
    description="Return reviews created by the current user.",
    responses={
        200: ReviewSerializer(many=True)
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_reviews(request):

    reviews = review_service.get_user_reviews(request.user)

    return APIResponse.success({
        "results": ReviewSerializer(
            reviews,
            many=True,
        ).data
    })


# ============================================================
# Review Analytics
# ============================================================
@extend_schema(
    summary="Review analytics",
    responses={
        200: ReviewAnalyticsSerializer
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def review_analytics(request):

    return APIResponse.success(
        review_service.get_review_analytics(
            request.user
        )
    )


# ============================================================
# Top Rated Anime
# ============================================================
@extend_schema(
    summary="Top rated anime",
    responses={
        200: TopRatedAnimeSerializer(many=True)
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_rated_anime(request):

    return APIResponse.success(
        review_service.get_top_rated(
            request.user
        ),
        "Top rated anime"
    )