from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request


class StatisticsService:
    CACHE_TIMEOUT = 60 * 60

    def get_statistics(self, anime_id):
        key = f"anime-statistics:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_statistics(anime_id),
        )

    def _fetch_statistics(self, anime_id):
        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/statistics"
        )

        if not data:
            return {}

        statistics = data.get("data") or {}
        if not isinstance(statistics, dict):
            return {}

        return self._normalize_statistics(statistics)

    @staticmethod
    def _normalize_statistics(data):
        watching = data.get("watching") or 0
        completed = data.get("completed") or 0
        on_hold = data.get("on_hold") or 0
        dropped = data.get("dropped") or 0
        plan_to_watch = data.get("plan_to_watch") or 0

        total = (
            watching
            + completed
            + on_hold
            + dropped
            + plan_to_watch
        )

        return {
            "watching": watching,
            "completed": completed,
            "on_hold": on_hold,
            "dropped": dropped,
            "plan_to_watch": plan_to_watch,
            "total": total,
        }
