from datetime import timedelta

from django.utils import timezone

from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request
from anime.infrastructure.models import Anime, AnimeTheme


class ThemeService:
    CACHE_TIMEOUT = 60 * 60
    DB_REFRESH_TIMEOUT = timedelta(days=30)

    def get_themes(self, anime_id):
        key = f"anime-themes:v2:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._get_or_fetch_themes(anime_id),
        )

    def _get_or_fetch_themes(self, anime_id):
        anime = Anime.objects.filter(mal_id=anime_id).first()
        if anime:
            cutoff = timezone.now() - self.DB_REFRESH_TIMEOUT
            rows = list(
                AnimeTheme.objects.filter(
                    anime=anime,
                    last_synced__gte=cutoff,
                ).order_by("theme_type", "position")
            )
            if rows:
                return self._serialize(rows)

        return self._fetch_and_store_themes(anime_id, anime)

    def _fetch_and_store_themes(self, anime_id, anime=None):
        data = safe_request(f"{BASE_URL}/anime/{anime_id}/themes")
        if not data:
            return {"openings": [], "endings": []}

        themes = data.get("data") or {}
        if not isinstance(themes, dict):
            return {"openings": [], "endings": []}

        anime = anime or Anime.objects.filter(mal_id=anime_id).first()
        if not anime:
            return {"openings": [], "endings": []}

        rows = []
        for theme_type, key in (("opening", "openings"), ("ending", "endings")):
            items = self._normalize_list(themes.get(key))
            rows.extend(
                AnimeTheme(
                    anime=anime,
                    theme_type=theme_type,
                    title=title,
                    position=position,
                )
                for position, title in enumerate(items, start=1)
            )

        AnimeTheme.objects.filter(anime=anime).delete()
        if rows:
            AnimeTheme.objects.bulk_create(rows)

        return self._serialize(rows)

    @staticmethod
    def _serialize(rows):
        result = {"openings": [], "endings": []}
        for row in rows:
            result[f"{row.theme_type}s"].append(row.title)
        return result

    @staticmethod
    def _normalize_list(items):
        if not isinstance(items, list):
            return []
        return [str(item).strip() for item in items if str(item).strip()]
