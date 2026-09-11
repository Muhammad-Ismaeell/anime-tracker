from rest_framework import serializers

from anime.presentation.serializers import AnimeListSerializer
from users.infrastructure.models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    anime = AnimeListSerializer(read_only=True)

    class Meta:
        model = Activity
        fields = [
            "id",
            "anime",
            "action",
            "created_at",
        ]
