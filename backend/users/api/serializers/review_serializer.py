from rest_framework import serializers

from users.infrastructure.models import Review
from anime.api.serializers import AnimeListSerializer


class ReviewSerializer(serializers.ModelSerializer):

    anime = AnimeListSerializer(read_only=True)

    user_id = serializers.IntegerField(
        source="user.id",
        read_only=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "anime",
            "user_id",
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