from rest_framework import serializers

from users.infrastructure.models import FavoriteAnime
from anime.api.serializers import AnimeListSerializer


class FavoriteSerializer(serializers.ModelSerializer):

    anime = AnimeListSerializer(read_only=True)

    class Meta:
        model = FavoriteAnime
        fields = [
            "id",
            "anime",
            "created_at",
        ]