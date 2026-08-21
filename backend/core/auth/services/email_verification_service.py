import hashlib
import secrets

from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from users.models import EmailVerification


class EmailVerificationService:

    TOKEN_BYTES = 32
    EXPIRATION_HOURS = 24

    @staticmethod
    def _hash_token(token: str) -> str:
        return hashlib.sha256(
            token.encode("utf-8")
        ).hexdigest()

    @classmethod
    def create_verification(cls, user):
        raw_token = secrets.token_urlsafe(cls.TOKEN_BYTES)

        token_hash = cls._hash_token(raw_token)

        verification, _ = EmailVerification.objects.update_or_create(
            user=user,
            defaults={
                "token_hash": token_hash,
                "expires_at": timezone.now() + timedelta(
                    hours=cls.EXPIRATION_HOURS
                ),
                "verified_at": None,
            },
        )

        return raw_token

    @classmethod
    def send_verification_email(
        cls,
        user,
        raw_token,
    ):
        frontend_url = getattr(
            settings,
            "FRONTEND_URL",
            "http://localhost:5173",
        )

        verification_url = (
            f"{frontend_url}/verify-email"
            f"?token={raw_token}"
        )

        send_mail(
            subject="Verify your Anime Tracker email",
            message=(
                f"Hi {user.username},\n\n"
                "Please verify your email address "
                "by opening the link below:\n\n"
                f"{verification_url}\n\n"
                "This link expires in 24 hours.\n\n"
                "If you did not create this account, "
                "you can ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

    @classmethod
    def verify_token(cls, raw_token: str):
        token_hash = cls._hash_token(raw_token)

        verification = (
            EmailVerification.objects
            .select_related("user")
            .filter(token_hash=token_hash)
            .first()
        )

        if not verification:
            return None, "Invalid verification token."

        if verification.is_verified:
            return (
                verification.user,
                None,
            )

        if verification.is_expired:
            return None, "Verification token has expired."

        verification.verified_at = timezone.now()

        verification.save(
            update_fields=["verified_at"]
        )

        return verification.user, None