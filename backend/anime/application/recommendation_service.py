from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import JikanClient


class RecommendationService:
    CACHE_TIMEOUT = 60 * 60

    def __init__(self, client=None):
        self.client = client or JikanClient()

    def get_recommendations(self, anime_id):
        key = f"anime-recommendations:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_recommendations(anime_id),
        )

    def get_general_recommendations(self, page=1):
        key = f"recommendations:page:{page}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_general_recommendations(page),
        )

    def _fetch_general_recommendations(self, page):
        response = self.client.get_general_recommendations(page)
        items = []

        for recommendation in response.get("items", []):
            entries = recommendation.get("entry") or []

            if not isinstance(entries, list) or len(entries) < 2:
                continue

            normalized_entries = []
            for entry in entries[:2]:
                if not isinstance(entry, dict):
                    continue

                mal_id = entry.get("mal_id")
                if not mal_id:
                    continue

                images = entry.get("images") or {}
                jpg = images.get("jpg") or {}
                webp = images.get("webp") or {}

                normalized_entries.append({
                    "id": mal_id,
                    "mal_id": mal_id,
                    "title": entry.get("title") or "Unknown Anime",
                    "image": (
                        jpg.get("image_url")
                        or webp.get("image_url")
                        or ""
                    ),
                })

            if len(normalized_entries) < 2:
                continue

            user = recommendation.get("user") or {}

            items.append({
                "id": recommendation.get("mal_id") or f"{normalized_entries[0]['id']}-{normalized_entries[1]['id']}",
                "entries": normalized_entries,
                "content": recommendation.get("content") or "",
                "user": user.get("username") or "",
                "date": recommendation.get("date"),
            })

        return {
            **response,
            "items": items,
        }

    def _fetch_recommendations(self, anime_id):
        recommendations = self.client.get_recommendations(anime_id)
        items = []

        for recommendation in recommendations:
            entry = recommendation.get("entry") or {}
            mal_id = entry.get("mal_id")

            if not mal_id:
                continue

            images = entry.get("images") or {}
            jpg = images.get("jpg") or {}
            webp = images.get("webp") or {}

            items.append({
                "id": mal_id,
                "mal_id": mal_id,
                "title": entry.get("title") or "Unknown Anime",
                "image": (
                    jpg.get("image_url")
                    or webp.get("image_url")
                    or ""
                ),
                "score": 0,
                "type": "",
                "year": None,
            })

        return items
