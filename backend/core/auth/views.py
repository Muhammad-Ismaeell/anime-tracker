from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from drf_spectacular.utils import extend_schema
from google.auth.transport import requests
from google.oauth2 import id_token
from django.utils.text import slugify
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from core.auth.docs import LoginRequestSerializer, ErrorSerializer, LoginResponseSerializer,RegisterRequestSerializer, RefreshResponseSerializer, RefreshRequestSerializer, GoogleLoginRequestSerializer, LogoutRequestSerializer
import hashlib

from django.utils import timezone

from users.models import EmailVerification
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from core.auth.services.auth_service import AuthService
from users.api.serializers import UserSerializer
from django.db import transaction

from core.auth.services.email_verification_service import (
    EmailVerificationService,
)
User = get_user_model()


# =========================
# REGISTER
# =========================
@extend_schema(
    summary="Register",
    description=(
        "Create a new account and send an email "
        "verification link."
    ),
    request=RegisterRequestSerializer,
    responses={
        201: ErrorSerializer,
        400: ErrorSerializer,
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):

    username = (
        request.data.get("username") or ""
    ).strip()

    email = (
        request.data.get("email") or ""
    ).strip().lower()

    password = (
        request.data.get("password") or ""
    )

    if not username or not email or not password:
        return Response(
            {
                "detail": (
                    "Username, email and password "
                    "are required."
                )
            },
            status=400,
        )

    if User.objects.filter(
        username=username
    ).exists():
        return Response(
            {
                "detail": "User already exists."
            },
            status=400,
        )

    if User.objects.filter(
        email__iexact=email
    ).exists():
        return Response(
            {
                "detail": (
                    "An account with this email "
                    "already exists."
                )
            },
            status=400,
        )

    with transaction.atomic():

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        raw_token = (
            EmailVerificationService.create_verification(
                user
            )
        )

        EmailVerificationService.send_verification_email(
            user,
            raw_token,
        )

    return Response(
        {
            "detail": (
                "Registration successful. "
                "Please check your email "
                "to verify your account."
            ),
            "email": user.email,
        },
        status=201,
    )


# =========================
# LOGIN
# =========================
@extend_schema(
    summary="Login",
    description=(
        "Authenticate a verified user and return "
        "JWT access and refresh tokens."
    ),
    request=LoginRequestSerializer,
    responses={
        200: LoginResponseSerializer,
        400: ErrorSerializer,
        403: ErrorSerializer,
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):

    username = (
        request.data.get("username") or ""
    ).strip()

    password = (
        request.data.get("password") or ""
    )

    if not username or not password:
        return Response(
            {"detail": "Missing credentials."},
            status=400,
        )

    user = authenticate(
        username=username,
        password=password,
    )

    if user is None:
        return Response(
            {"detail": "Invalid credentials."},
            status=400,
        )

    verification = getattr(
        user,
        "email_verification",
        None,
    )

    if verification is None:
        return Response(
            {
                "detail": (
                    "Please verify your email "
                    "before logging in."
                )
            },
            status=403,
        )

    if not verification.is_verified:
        return Response(
            {
                "detail": (
                    "Please verify your email "
                    "before logging in."
                )
            },
            status=403,
        )

    return Response(
        {
            **AuthService.create_tokens(user),
            "user": UserSerializer(user).data,
        }
    )


# =========================
# REFRESH TOKEN
# =========================
@extend_schema(
    summary="Refresh Access Token",
    description="Generate a new access token using a refresh token.",
    request=RefreshRequestSerializer,
    responses={
        200: RefreshResponseSerializer,
        401: ErrorSerializer,
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):

    token = (
        request.COOKIES.get("refresh_token")
        or request.data.get("refresh")
    )

    if not token:
        return Response(
            {"detail": "No refresh token"},
            status=401,
        )

    try:
        refresh = RefreshToken(token)

        return Response({
            "access": str(refresh.access_token)
        })

    except TokenError:
        return Response(
            {"detail": "Invalid refresh token"},
            status=401,
        )


# =========================
# GOOGLE LOGIN
# =========================
@extend_schema(
    summary="Google Login",
    description="Authenticate using a Google ID token.",
    request=GoogleLoginRequestSerializer,
    responses={
        200: LoginResponseSerializer,
        400: ErrorSerializer,
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):

    token = request.data.get("token")

    try:
        google_request = requests.Request()

        data = id_token.verify_oauth2_token(
            token,
            google_request,
            settings.GOOGLE_CLIENT_ID
        )

    except ValueError:
        return Response(
            {
                "detail": "Invalid Google token"
            },
            status=400
        )

    email = data["email"]

    username = slugify(
        email.split("@")[0]
    )

    base_username = slugify(email.split("@")[0])

    username = base_username
    counter = 1

    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1


    user, _ = User.objects.get_or_create(
        email=email,
        defaults={
            "username": username,
            "first_name": data.get("name", ""),
        },
    )

    verified_token_hash = hashlib.sha256(
        f"google:{email}".encode("utf-8")
    ).hexdigest()

    EmailVerification.objects.update_or_create(
        user=user,
        defaults={
            "token_hash": verified_token_hash,
            "expires_at": timezone.now(),
            "verified_at": timezone.now(),
        },
    )

    return Response({
        **AuthService.create_tokens(user),
        "user": UserSerializer(user).data,
    })


# =========================
# LOGOUT ALL
# =========================

@extend_schema(
    request=LogoutRequestSerializer,
    responses={200: None},
)
@api_view(["POST"])
@permission_classes([AllowAny])
def logout(request):

    refresh_token = request.data.get("refresh")

    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass

    return Response({
        "message":"Logged out successfully"
    })

@extend_schema(
    summary="Current User",
    responses={
        200: UserSerializer
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):

    return Response(
        UserSerializer(request.user).data
    )

@extend_schema(
    summary="Verify Email",
    description="Verify a user's email address using a verification token.",
    responses={
        200: ErrorSerializer,
        400: ErrorSerializer,
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def verify_email(request):

    token = (
        request.query_params.get("token") or ""
    ).strip()

    if not token:
        return Response(
            {
                "detail": (
                    "Verification token is required."
                )
            },
            status=400,
        )

    user, error_message = (
        EmailVerificationService.verify_token(token)
    )

    if error_message:
        return Response(
            {
                "detail": error_message
            },
            status=400,
        )

    return Response(
        {
            "detail": (
                "Email verified successfully. "
                "You can now log in."
            )
        }
    )