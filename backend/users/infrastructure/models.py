from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

from anime.infrastructure.models import Anime
from datetime import timedelta

from django.utils import timezone


# =========================
# PROFILE
# =========================
class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True
    )

    bio = models.TextField(blank=True)

    favorite_genre = models.CharField(max_length=100, blank=True)

    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


# =========================
# USER ANIME STATUS
# =========================
class UserAnimeStatus(models.Model):
    STATUS_CHOICES = [
        ("watching", "Watching"),
        ("completed", "Completed"),
        ("plan_to_watch", "Plan to Watch"),
        ("dropped", "Dropped"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    anime = models.ForeignKey(Anime, on_delete=models.CASCADE)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="plan_to_watch",
    )

    progress = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )

    started_at = models.DateField(null=True, blank=True)
    completed_at = models.DateField(null=True, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "anime"],
                name="unique_user_anime_status"
            )
        ]
        indexes = [
            models.Index(fields=["user", "status"]),
        ]


# =========================
# FAVORITES
# =========================
class FavoriteAnime(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    anime = models.ForeignKey(Anime, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["user", "anime"],
                name="unique_user_anime_favorite",
            )
        ]

        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]


# =========================
# REVIEWS
# =========================
class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    anime = models.ForeignKey(Anime, on_delete=models.CASCADE)

    rating = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(10)
        ]
    )

    text = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "anime"],
                name="unique_user_anime_review",
            )
        ]

        indexes = [
            models.Index(fields=["anime", "-created_at"]),
            models.Index(fields=["user", "-created_at"]),
        ]
        


# =========================
# ACTIVITY
# =========================
class Activity(models.Model):
    ACTION_TYPES = (
        ("ADDED", "Added to library"),
        ("REMOVED", "Removed from library"),
        ("WATCHING", "Watching"),
        ("COMPLETED", "Completed"),
        ("DROPPED", "Dropped"),
        ("FAVORITED", "Favorited"),
        ("UNFAVORITED", "Unfavorited"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    anime = models.ForeignKey(
        Anime,
        on_delete=models.CASCADE,
    )

    action = models.CharField(
        max_length=20,
        choices=ACTION_TYPES,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        indexes = [
            models.Index(
                fields=["user", "-created_at"]
            ),
        ]


class EmailVerification(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_verification",
    )

    token_hash = models.CharField(
        max_length=128,
        unique=True,
    )

    expires_at = models.DateTimeField()

    verified_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        verbose_name = "Email Verification"
        verbose_name_plural = "Email Verifications"

    @property
    def is_verified(self):
        return self.verified_at is not None

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f"Email verification for {self.user}"