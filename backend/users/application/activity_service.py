from users.infrastructure.models import Activity, UserAnimeStatus


class ActivityService:


    def create(self, user, anime, action):

        return Activity.objects.create(
            user=user,
            anime=anime,
            action=action
        )
