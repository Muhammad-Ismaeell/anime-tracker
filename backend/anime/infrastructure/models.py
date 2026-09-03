# anime/infrastructure/models.py

from django.db import models


class Genre(models.Model):

    mal_id = models.IntegerField(
        unique=True
    )

    name = models.CharField(
        max_length=100
    )

    def __str__(self):
        return self.name


class Anime(models.Model):

    mal_id = models.IntegerField(
        unique=True
    )

    title = models.CharField(
        max_length=255,
        db_index=True
    )

    title_english = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )

    search_title = models.CharField(
        max_length=255,
        blank=True,
        db_index=True
    )

    genres = models.ManyToManyField(
        Genre,
        blank=True
    )

    image = models.URLField(
        null=True,
        blank=True
    )

    image_large = models.URLField(
        null=True,
        blank=True
    )

    synopsis = models.TextField(
        null=True,
        blank=True
    )

    score = models.FloatField(
        null=True,
        blank=True,
        db_index=True
    )

    popularity = models.IntegerField(
        null=True,
        blank=True
    )

    type = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        db_index=True
    )

    episodes = models.IntegerField(
        null=True,
        blank=True
    )

    year = models.IntegerField(
        null=True,
        blank=True,
        db_index=True
    )

    season = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        db_index=True
    )

    status = models.CharField(
        max_length=50,
        blank=True,
        default="",
        db_index=True
    )

    rating = models.CharField(
        max_length=40,
        blank=True,
        default=""
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    last_synced = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        ordering = [
            "-score"
        ]

        indexes=[
            models.Index(fields=["year"]),
            models.Index(fields=["season"]),
            models.Index(fields=["type"]),
            models.Index(fields=["score"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.title
