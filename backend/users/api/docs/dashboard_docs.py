from rest_framework import serializers


class DashboardResponseSerializer(serializers.Serializer):

    watching = serializers.IntegerField()

    completed = serializers.IntegerField()

    plan_to_watch = serializers.IntegerField()

    dropped = serializers.IntegerField()

    total = serializers.IntegerField()

    favorites = serializers.IntegerField()