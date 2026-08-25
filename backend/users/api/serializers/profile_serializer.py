from rest_framework import serializers

from users.infrastructure.models import Profile

class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = [
            "user",
            "avatar",
            "bio",
            "favorite_genre",
        ]