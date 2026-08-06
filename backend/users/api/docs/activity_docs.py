from rest_framework import serializers

from anime.api.serializers import AnimeSerializer


class ActivityItemSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    anime = AnimeSerializer()

    action = serializers.CharField()

    created_at = serializers.DateTimeField()



class ActivityResponseSerializer(serializers.Serializer):

    count = serializers.IntegerField()

    next = serializers.URLField(
        allow_null=True
    )

    previous = serializers.URLField(
        allow_null=True
    )

    results = ActivityItemSerializer(
        many=True
    )
    
    