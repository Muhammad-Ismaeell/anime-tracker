from rest_framework import serializers

from users.infrastructure.models import Activity
from anime.api.serializers import AnimeSerializer


class ActivitySerializer(serializers.ModelSerializer):

    anime = AnimeSerializer(read_only=True)

    class Meta:
        model = Activity
        fields = [
            "id",
            "anime",
            "action",
            "created_at",
        ]