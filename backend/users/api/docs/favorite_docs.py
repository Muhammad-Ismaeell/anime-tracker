from rest_framework import serializers

from users.api.serializers import FavoriteSerializer


class ToggleFavoriteRequestSerializer(serializers.Serializer):

    anime_id = serializers.IntegerField(
        help_text="MyAnimeList anime ID"
    )


class ToggleFavoriteDataSerializer(serializers.Serializer):

    anime_id = serializers.IntegerField()

    added = serializers.BooleanField()


class ToggleFavoriteResponseSerializer(serializers.Serializer):

    success = serializers.BooleanField()

    message = serializers.CharField()

    data = ToggleFavoriteDataSerializer()


class FavoriteListResponseSerializer(serializers.Serializer):

    count = serializers.IntegerField()

    next = serializers.URLField(
        allow_null=True
    )

    previous = serializers.URLField(
        allow_null=True
    )

    results = FavoriteSerializer(
        many=True
    )