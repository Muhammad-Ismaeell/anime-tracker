from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

from anime.infrastructure.models import Anime


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
        on_delete=models.PROTECT
    )

    anime = models.ForeignKey(Anime, on_delete=models.CASCADE)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        null=True,
        blank=True
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
            models.Index(fields=["user"]),
            models.Index(fields=["status"]),
        ]


# =========================
# FAVORITES
# =========================
class FavoriteAnime(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT
    )

    anime = models.ForeignKey(Anime, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "anime")
        indexes = [models.Index(fields=["user"])]


# =========================
# REVIEWS
# =========================
class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT
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
        unique_together = ("user", "anime")
        indexes = [
            models.Index(fields=["anime"]),
            models.Index(fields=["user"]),
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
        on_delete=models.PROTECT
    )

    anime = models.ForeignKey(Anime, on_delete=models.CASCADE)

    action = models.CharField(max_length=20, choices=ACTION_TYPES)

    created_at = models.DateTimeField(auto_now_add=True)


