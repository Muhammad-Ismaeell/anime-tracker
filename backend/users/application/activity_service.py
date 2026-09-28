from users.infrastructure.models import Activity


class ActivityService:

    VALID_ACTIONS = {
        "ADDED",
        "REMOVED",
        "WATCHING",
        "COMPLETED",
        "DROPPED",
        "FAVORITED",
        "UNFAVORITED",
    }

    def create(self, user, anime, action):
        """Create an activity after validating its action type."""

        if action not in self.VALID_ACTIONS:
            raise ValueError(
                f"Invalid activity action: {action}"
            )

        return Activity.objects.create(
            user=user,
            anime=anime,
            action=action,
        )
