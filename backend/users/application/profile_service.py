from django.contrib.auth import get_user_model

from rest_framework.exceptions import ValidationError

from users.infrastructure.models import (
    Profile,
    UserAnimeStatus,
)


User = get_user_model()


class ProfileService:

    def get_profile(self, user):
        profile, _ = Profile.objects.get_or_create(
            user=user
        )

        qs = UserAnimeStatus.objects.filter(
            user=user
        )

        return user, profile, qs

    def update_profile(
        self,
        user,
        data,
        files,
    ):
        profile, _ = Profile.objects.get_or_create(
            user=user
        )

        username = data.get("username")

        if username is not None:
            username = username.strip()

            if not username:
                raise ValidationError({
                    "username": "Username cannot be empty."
                })

            if username != user.username:
                username_exists = User.objects.filter(
                    username=username
                ).exclude(
                    id=user.id
                ).exists()

                if username_exists:
                    raise ValidationError({
                        "username": (
                            "This username is already taken."
                        )
                    })

                user.username = username
                user.save(
                    update_fields=["username"]
                )

        profile.bio = data.get(
            "bio",
            profile.bio,
        )

        profile.favorite_genre = data.get(
            "favorite_genre",
            profile.favorite_genre,
        )

        if files.get("avatar"):
            profile.avatar = files["avatar"]

        profile.save()

        return profile