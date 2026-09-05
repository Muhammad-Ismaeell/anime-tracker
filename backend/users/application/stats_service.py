
from users.infrastructure.models import (
    UserAnimeStatus,
    FavoriteAnime,
    Activity,
)


class StatsService:

    def get_stats(self, user):

        qs = UserAnimeStatus.objects.filter(
            user=user
        )

        stats = {
            "watching": qs.filter(
                status="watching"
            ).count(),

            "completed": qs.filter(
                status="completed"
            ).count(),

            "plan_to_watch": qs.filter(
                status="plan_to_watch"
            ).count(),

            "dropped": qs.filter(
                status="dropped"
            ).count(),
        }

        return {
            **stats,

            "total": qs.count(),

            "favorites": FavoriteAnime.objects.filter(
                user=user
            ).count(),
        }


    def get_dashboard(self, user):

        # ==================================================
        # LIBRARY
        # ==================================================

        library_qs = (
            UserAnimeStatus.objects
            .filter(user=user)
            .select_related("anime")
        )


        # ==================================================
        # LIBRARY STATS
        # ==================================================

        stats = {
            "total": library_qs.count(),

            "watching": library_qs.filter(
                status="watching"
            ).count(),

            "completed": library_qs.filter(
                status="completed"
            ).count(),

            "plan_to_watch": library_qs.filter(
                status="plan_to_watch"
            ).count(),

            "dropped": library_qs.filter(
                status="dropped"
            ).count(),
        }


        # ==================================================
        # OVERALL PROGRESS
        # ==================================================
        #
        # Progress is based only on anime that the user
        # has started watching or completed.
        #
        # Each anime's progress is capped at its known
        # episode count before calculating the totals.
        #
        # This protects the dashboard even if an older
        # database record contains an invalid progress value.
        # ==================================================

        progress_qs = library_qs.filter(
            status__in=[
                "watching",
                "completed",
            ]
        )

        episodes_watched = 0
        episodes_available = 0

        for item in progress_qs:

            available = item.anime.episodes or 0
            progress = item.progress or 0

            if available > 0:

                progress = min(
                    max(progress, 0),
                    available,
                )

                episodes_watched += progress
                episodes_available += available

            else:

                episodes_watched += max(
                    progress,
                    0,
                )

        if episodes_available > 0:

            progress_percentage = round(
                (
                    episodes_watched /
                    episodes_available
                ) * 100
            )

            progress_percentage = min(
                progress_percentage,
                100
            )

        else:

            progress_percentage = 0


        stats["progress"] = {
            "episodes_watched": episodes_watched,

            "episodes_available": episodes_available,

            "percentage": progress_percentage,
        }


        # ==================================================
        # CONTINUE WATCHING
        # ==================================================

        watching_items = (
            library_qs
            .filter(status="watching")
            .order_by("-updated_at")[:8]
        )

        stats["currently_watching"] = [

            {
                "id": item.anime.mal_id,

                "title": item.anime.title,

                "image": item.anime.image,

                "episodes": item.anime.episodes,

                "progress": (
                    min(
                        max(item.progress or 0, 0),
                        item.anime.episodes,
                    )
                    if item.anime.episodes
                    else max(
                        item.progress or 0,
                        0,
                    )
                ),
            }

            for item in watching_items
        ]


        # ==================================================
        # RECENT ACTIVITY
        # ==================================================

        activities = (
            Activity.objects
            .filter(user=user)
            .select_related("anime")
            .order_by("-created_at")[:8]
        )

        stats["recent_activity"] = [

            {
                "id": activity.id,

                "action": activity.action,

                "created_at": activity.created_at,

                "anime": {
                    "id": activity.anime.mal_id,

                    "title": activity.anime.title,

                    "image": activity.anime.image,
                },
            }

            for activity in activities
        ]


        # ==================================================
        # RECENTLY COMPLETED
        # ==================================================

        completed_items = (
            library_qs
            .filter(status="completed")
            .order_by(
                "-completed_at",
                "-updated_at",
            )[:6]
        )

        stats["recently_completed"] = [

            {
                "id": item.anime.mal_id,

                "title": item.anime.title,

                "image": item.anime.image,
            }

            for item in completed_items
        ]


        return stats
