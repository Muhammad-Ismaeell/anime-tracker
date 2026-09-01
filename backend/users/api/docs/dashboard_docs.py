from rest_framework import serializers


class DashboardAnimeSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    title = serializers.CharField()

    image = serializers.CharField(
        allow_blank=True,
        allow_null=True,
        required=False,
    )


class DashboardWatchingSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    title = serializers.CharField()

    image = serializers.CharField(
        allow_blank=True,
        allow_null=True,
        required=False,
    )

    episodes = serializers.IntegerField(
        allow_null=True,
        required=False,
    )

    progress = serializers.IntegerField()


class DashboardProgressSerializer(serializers.Serializer):

    episodes_watched = serializers.IntegerField()

    episodes_available = serializers.IntegerField()

    percentage = serializers.IntegerField()


class DashboardActivitySerializer(serializers.Serializer):

    id = serializers.IntegerField()

    action = serializers.CharField()

    created_at = serializers.DateTimeField()

    anime = DashboardAnimeSerializer()


class DashboardResponseSerializer(serializers.Serializer):

    # ==========================================
    # LIBRARY STATS
    # ==========================================

    watching = serializers.IntegerField()

    completed = serializers.IntegerField()

    plan_to_watch = serializers.IntegerField()

    dropped = serializers.IntegerField()

    total = serializers.IntegerField()

    favorites = serializers.IntegerField()

    # ==========================================
    # PROGRESS
    # ==========================================

    progress = DashboardProgressSerializer()

    # ==========================================
    # CURRENTLY WATCHING
    # ==========================================

    currently_watching = DashboardWatchingSerializer(
        many=True
    )

    # ==========================================
    # RECENT ACTIVITY
    # ==========================================

    recent_activity = DashboardActivitySerializer(
        many=True
    )

    # ==========================================
    # RECENTLY COMPLETED
    # ==========================================

    recently_completed = DashboardAnimeSerializer(
        many=True
    )

    # ==========================================
    # REVIEW STATS
    # ==========================================

    review_count = serializers.IntegerField()

    average_rating = serializers.FloatField(
        allow_null=True
    )

    # ==========================================
    # YEARLY STATS
    # ==========================================

    year = serializers.IntegerField()

    yearly_completed = serializers.IntegerField()

    yearly_added = serializers.IntegerField()

    yearly_favorited = serializers.IntegerField()

    yearly_reviews = serializers.IntegerField()