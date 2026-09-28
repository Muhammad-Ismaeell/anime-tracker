from rest_framework_simplejwt.tokens import RefreshToken


class AuthService:

    @staticmethod
    def create_tokens(user):
        """Create JWT access and refresh tokens for a user."""

        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }