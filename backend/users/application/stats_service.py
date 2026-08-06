from django.core.cache import cache
from users.infrastructure.models import UserAnimeStatus,FavoriteAnime



class StatsService:

    def get_stats(self, user):

        key = f"stats:{user.id}"
        cached = cache.get(key)

        if cached is not None:
            return cached

        qs = UserAnimeStatus.objects.filter(user=user)

        stats = {
            "watching": qs.filter(status="watching").count(),
            "completed": qs.filter(status="completed").count(),
            "plan_to_watch": qs.filter(status="plan_to_watch").count(),
            "dropped": qs.filter(status="dropped").count(),
        }

        return_data = {
            **stats,
            "total": sum(stats.values()),
        }

        cache.set(key, return_data, 600)
        return return_data
    
    def get_dashboard(self, user):

        stats = self.get_stats(user).copy()

        stats["favorites"] = FavoriteAnime.objects.filter(
            user=user
        ).count()

        return stats
