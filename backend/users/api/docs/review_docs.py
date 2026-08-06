from rest_framework import serializers


class ReviewCreateRequestSerializer(serializers.Serializer):

    anime_id = serializers.IntegerField()

    rating = serializers.IntegerField(
        min_value=1,
        max_value=10
    )

    text = serializers.CharField(
        required=False,
        allow_blank=True
    )



class ReviewUpdateRequestSerializer(serializers.Serializer):

    rating = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=10
    )

    text = serializers.CharField(
        required=False,
        allow_blank=True
    )