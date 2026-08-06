from rest_framework import serializers

from users.infrastructure.models import Review
from anime.api.serializers import AnimeSerializer


class ReviewSerializer(serializers.ModelSerializer):

    anime = AnimeSerializer(read_only=True)
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "anime",
            "username",
            "rating",
            "text",
            "created_at",
            "updated_at",
        ]

class ReviewAnalyticsSerializer(serializers.Serializer):

    review_count = serializers.IntegerField()

    average_rating = serializers.FloatField()

    highest_rating = serializers.IntegerField()

class TopRatedAnimeSerializer(serializers.Serializer):

    anime_id = serializers.IntegerField()

    title = serializers.CharField()

    image = serializers.URLField()

    rating = serializers.IntegerField()