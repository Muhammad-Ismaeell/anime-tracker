from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request


class ThemeService:
    CACHE_TIMEOUT = 60 * 60

    def get_themes(self, anime_id):
        key = f"anime-themes:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_themes(anime_id),
        )

    def _fetch_themes(self, anime_id):
        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/themes"
        )

        if not data:
            return {
                "openings": [],
                "endings": [],
            }

        themes = data.get("data") or {}

        if not isinstance(themes, dict):
            return {
                "openings": [],
                "endings": [],
            }

        return {
            "openings": self._normalize_list(themes.get("openings")),
            "endings": self._normalize_list(themes.get("endings")),
        }

    @staticmethod
    def _normalize_list(items):
        if not isinstance(items, list):
            return []

        return [str(item).strip() for item in items if str(item).strip()]
