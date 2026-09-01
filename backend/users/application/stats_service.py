from django.db.models import Avg, Sum
from django.utils import timezone

from users.infrastructure.models import (
    UserAnimeStatus,
    FavoriteAnime,
    Activity,
    Review,
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
        # BASIC STATS
        # ==================================================

        stats = {
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

            "total": library_qs.count(),

            "favorites": FavoriteAnime.objects.filter(
                user=user
            ).count(),
        }


        # ==================================================
        # PROGRESS
        # ==================================================

        progress_data = library_qs.aggregate(
            episodes_watched=Sum("progress"),
        )

        episodes_watched = (
            progress_data["episodes_watched"]
            or 0
        )


        episodes_available = 0

        for item in library_qs:

            if item.anime.episodes:
                episodes_available += item.anime.episodes


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
        # CURRENTLY WATCHING
        # ==================================================

        watching_items = (
            library_qs
            .filter(status="watching")
            .order_by("-updated_at")[:6]
        )


        stats["currently_watching"] = [

            {
                "id": item.anime.mal_id,

                "title": item.anime.title,

                "image": item.anime.image,

                "episodes": item.anime.episodes,

                "progress": item.progress,
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
            .order_by("-completed_at", "-updated_at")[:6]
        )


        stats["recently_completed"] = [

            {
                "id": item.anime.mal_id,

                "title": item.anime.title,

                "image": item.anime.image,

            }

            for item in completed_items
        ]


        # ==================================================
        # REVIEW STATISTICS
        # ==================================================

        review_stats = Review.objects.filter(
            user=user
        ).aggregate(
            average_rating=Avg("rating"),
        )


        stats["review_count"] = Review.objects.filter(
            user=user
        ).count()


        stats["average_rating"] = (
            round(
                review_stats["average_rating"],
                1
            )
            if review_stats["average_rating"] is not None
            else None
        )


        # ==================================================
        # YEARLY ACTIVITY
        # ==================================================

        current_year = timezone.now().year

        stats["year"] = current_year


        stats["yearly_completed"] = (
            library_qs
            .filter(
                status="completed",
                completed_at__year=current_year,
            )
            .count()
        )


        stats["yearly_added"] = (
            Activity.objects
            .filter(
                user=user,
                action="ADDED",
                created_at__year=current_year,
            )
            .count()
        )


        stats["yearly_favorited"] = (
            Activity.objects
            .filter(
                user=user,
                action="FAVORITED",
                created_at__year=current_year,
            )
            .count()
        )


        stats["yearly_reviews"] = (
            Review.objects
            .filter(
                user=user,
                created_at__year=current_year,
            )
            .count()
        )


        return stats