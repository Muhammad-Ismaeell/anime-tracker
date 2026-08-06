from users.infrastructure.models import Profile, UserAnimeStatus




class ProfileService:

    def get_profile(self, user):

        profile, _ = Profile.objects.get_or_create(user=user)

        qs = UserAnimeStatus.objects.filter(user=user)

        return user, profile, qs

    def update_profile(self, user, data, files):

        profile, _ = Profile.objects.get_or_create(user=user)

        profile.bio = data.get("bio", profile.bio)
        profile.favorite_genre = data.get("favorite_genre", profile.favorite_genre)

        if files.get("avatar"):
            profile.avatar = files["avatar"]

        profile.save()

        return profile