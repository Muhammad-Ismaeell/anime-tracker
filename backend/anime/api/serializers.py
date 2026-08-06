from rest_framework import serializers
from anime.infrastructure.models import Anime
class AnimeSerializer(serializers.ModelSerializer):

    id = serializers.IntegerField(source="mal_id")

    class Meta:
        model = Anime
        fields = [
            "id",
            "title",
            "image",
            "score",
            "synopsis",
            "episodes",
            "type",
            "year",
            "season",
        ]