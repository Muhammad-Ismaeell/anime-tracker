from rest_framework import serializers


class AnimeDocSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    image = serializers.CharField(allow_null=True)
    score = serializers.FloatField(allow_null=True)
    synopsis = serializers.CharField(allow_null=True)
    episodes = serializers.IntegerField(allow_null=True)
    type = serializers.CharField(allow_null=True)
    year = serializers.IntegerField(allow_null=True)
    season = serializers.CharField(allow_null=True)

class AnimeListResponseSerializer(serializers.Serializer):
    items = AnimeDocSerializer(many=True)
    page = serializers.IntegerField()
    has_next = serializers.BooleanField()

class AnimeDetailDocSerializer(serializers.Serializer):

    id = serializers.IntegerField()
    title = serializers.CharField()
    image = serializers.CharField(allow_null=True)
    score = serializers.FloatField(allow_null=True)
    episodes = serializers.IntegerField(allow_null=True)
    status = serializers.CharField(allow_null=True)
    type = serializers.CharField(allow_null=True)
    year = serializers.IntegerField(allow_null=True)
    season = serializers.CharField(allow_null=True)

    genres = serializers.ListField(
        child=serializers.CharField()
    )

    studios = serializers.ListField(
        child=serializers.CharField()
    )

    synopsis = serializers.CharField(
        allow_null=True
    )

    trailer = serializers.DictField()

class AnimeDetailResponseSerializer(serializers.Serializer):

    item = AnimeDetailDocSerializer()

class AnimeSearchDataSerializer(serializers.Serializer):
    items = AnimeDocSerializer(many=True)
    page = serializers.IntegerField()
    has_next = serializers.BooleanField()
    total = serializers.IntegerField()


class AnimeSearchResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    data = AnimeSearchDataSerializer()