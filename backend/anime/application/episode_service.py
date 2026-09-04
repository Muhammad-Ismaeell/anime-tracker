from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request


class EpisodeService:
    CACHE_TIMEOUT = 60 * 60

    def get_episodes(self, anime_id, page=1):
        page = max(1, int(page or 1))
        key = f"anime-episodes:{anime_id}:page:{page}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_episodes(anime_id, page),
        )

    def _fetch_episodes(self, anime_id, page):
        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/episodes",
            params={"page": page},
        )

        if not data:
            return {
                "items": [],
                "page": page,
                "has_next": False,
                "total": 0,
            }

        pagination = data.get("pagination") or {}
        pagination_items = pagination.get("items") or {}

        if isinstance(pagination_items, dict):
            total = pagination_items.get("total") or 0
        else:
            total = pagination_items or pagination.get("total") or 0

        items = []

        for episode in data.get("data") or []:
            mal_id = episode.get("mal_id")
            if not mal_id:
                continue

            duration = episode.get("duration")
            if duration is not None:
                try:
                    duration = round(float(duration) / 60)
                except (TypeError, ValueError):
                    pass

            items.append({
                "id": mal_id,
                "mal_id": mal_id,
                "number": episode.get("mal_id"),
                "title": episode.get("title") or "Untitled Episode",
                "title_japanese": episode.get("title_japanese"),
                "title_romanji": episode.get("title_romanji"),
                "aired": episode.get("aired"),
                "score": episode.get("score"),
                "filler": bool(episode.get("filler")),
                "recap": bool(episode.get("recap")),
                "duration": duration,
                "url": episode.get("url"),
            })

        return {
            "items": items,
            "page": pagination.get("current_page", page),
            "has_next": pagination.get("has_next_page", False),
            "total": total,
        }
