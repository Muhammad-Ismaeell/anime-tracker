from rest_framework import serializers
from users.api.serializers import UserSerializer, ProfileSerializer


class ProfileResponseSerializer(serializers.Serializer):

    user = UserSerializer()

    profile = ProfileSerializer()


class UpdateProfileRequestSerializer(serializers.Serializer):

    bio = serializers.CharField(
        required=False,
        allow_blank=True
    )

    favorite_genre = serializers.CharField(
        required=False,
        allow_blank=True
    )

    avatar = serializers.ImageField(
        required=False
    )


class UpdateProfileResponseSerializer(serializers.Serializer):

    user = UserSerializer()

    profile = ProfileSerializer()