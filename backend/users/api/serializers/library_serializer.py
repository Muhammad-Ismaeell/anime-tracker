from rest_framework import serializers

from anime.presentation.serializers import AnimeListSerializer
from users.infrastructure.models import UserAnimeStatus


class LibrarySerializer(serializers.ModelSerializer):
    anime = AnimeListSerializer(read_only=True)

    class Meta:
        model = UserAnimeStatus
        fields = [
            "id",
            "anime",
            "status",
            "progress",
            "started_at",
            "completed_at",
        ]
