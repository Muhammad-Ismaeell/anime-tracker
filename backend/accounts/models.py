from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)

    google_sub = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
    )

    auth_provider = models.CharField(
        max_length=20,
        default="local",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username