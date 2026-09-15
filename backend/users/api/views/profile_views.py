from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

from core.responses import APIResponse
from users.api.docs.profile_docs import (
    ProfileResponseSerializer,
    UpdateProfileRequestSerializer,
    UpdateProfileResponseSerializer,
)
from users.api.serializers import ProfileSerializer, UserSerializer
from users.application.profile_service import ProfileService


profile_service = ProfileService()


@extend_schema(
    summary="Get Profile",
    description="Return authenticated user's profile information.",
    responses={200: ProfileResponseSerializer},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    """Return the authenticated user's account and profile data."""
    user, profile_obj, _ = profile_service.get_profile(request.user)

    return APIResponse.success(
        {
            "user": UserSerializer(user).data,
            "profile": ProfileSerializer(profile_obj).data,
        },
        "Profile fetched",
    )


@extend_schema(
    summary="Update Profile",
    request=UpdateProfileRequestSerializer,
    description="Update username, bio, favorite genre, or avatar.",
    responses={200: UpdateProfileResponseSerializer},
)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_profile(request):
    """Update the authenticated user's profile."""
    profile_obj = profile_service.update_profile(
        request.user,
        request.data,
        request.FILES,
    )

    return APIResponse.success(
        {
            "user": UserSerializer(request.user).data,
            "profile": ProfileSerializer(profile_obj).data,
        },
        "Profile updated",
    )
