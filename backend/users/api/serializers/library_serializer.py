from rest_framework import serializers

from users.infrastructure.models import UserAnimeStatus
from anime.api.serializers import AnimeSerializer


class LibrarySerializer(serializers.ModelSerializer):

    anime = AnimeSerializer(read_only=True)

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