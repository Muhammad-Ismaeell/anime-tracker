from rest_framework.decorators import (
    api_view,
    permission_classes,
    parser_classes,
)
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from core.responses import APIResponse
from users.application.profile_service import ProfileService
from users.api.serializers import UserSerializer
from users.api.serializers import ProfileSerializer
from drf_spectacular.utils import extend_schema

from users.api.docs.profile_docs import (
    ProfileResponseSerializer,
    UpdateProfileRequestSerializer,
    UpdateProfileResponseSerializer,
)
profile_service = ProfileService()
# ============================================================
# Profile
# ============================================================

@extend_schema(
    summary="Get Profile",
    description="Return authenticated user's profile information.",
    responses={
        200: ProfileResponseSerializer
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):

    user, profile_obj, _ = profile_service.get_profile(
        request.user
    )

    return APIResponse.success(
        {
            "user": UserSerializer(user).data,
            "profile": ProfileSerializer(profile_obj).data,
        },
        "Profile fetched"
    )


# ============================================================
# Update Profile
# ============================================================

@extend_schema(
    summary="Update Profile",
    request=UpdateProfileRequestSerializer,
    description="""
        Update user profile information.

        Supports:
        - bio
        - favorite genre
        - avatar upload
        """,
    responses={
        200: UpdateProfileResponseSerializer
    }
)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([
    MultiPartParser,
    FormParser,
    JSONParser,
])
def update_profile(request):

    profile = profile_service.update_profile(
        request.user,
        request.data,
        request.FILES,
    )

    return APIResponse.success(
        {
            "user": UserSerializer(request.user).data,
            "profile": ProfileSerializer(profile).data,
        },
        "Profile updated"
    )