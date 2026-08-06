from rest_framework import serializers


class LibraryUpdateRequestSerializer(serializers.Serializer):

    anime_id = serializers.IntegerField()

    status = serializers.ChoiceField(
        choices=[
            "watching",
            "completed",
            "plan_to_watch",
            "dropped"
        ]
    )

    progress = serializers.IntegerField(
        required=False,
        default=0
    )

    remove = serializers.BooleanField(
        required=False,
        default=False
    )


class LibraryStatsResponseSerializer(serializers.Serializer):

    watching = serializers.IntegerField()

    completed = serializers.IntegerField()

    plan_to_watch = serializers.IntegerField()

    dropped = serializers.IntegerField()

    total = serializers.IntegerField()