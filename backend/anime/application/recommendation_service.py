from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import JikanClient, is_nsfw


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

    def _fetch_recommendations(self, anime_id):
        recommendations = self.client.get_recommendations(anime_id)
        items = []

        for recommendation in recommendations:
            entry = recommendation.get("entry") or {}
            mal_id = entry.get("mal_id")

            if not mal_id:
                continue

            item = {
                "mal_id": mal_id,
                "title": entry.get("title") or "Unknown Anime",
                "image": (
                    entry.get("images", {})
                    .get("jpg", {})
                    .get("image_url")
                    or entry.get("images", {})
                    .get("webp", {})
                    .get("image_url")
                    or ""
                ),
                "score": 0,
                "type": "",
                "year": None,
            }

            if not is_nsfw(item):
                items.append(item)

        return items
