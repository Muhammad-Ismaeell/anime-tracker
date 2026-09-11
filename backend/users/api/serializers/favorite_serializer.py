from rest_framework import serializers

from anime.presentation.serializers import AnimeListSerializer
from users.infrastructure.models import FavoriteAnime


class FavoriteSerializer(serializers.ModelSerializer):
    anime = AnimeListSerializer(read_only=True)

    class Meta:
        model = FavoriteAnime
        fields = [
            "id",
            "anime",
            "created_at",
        ]
