from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, JikanClient, safe_request


class NewsService:
    CACHE_TIMEOUT = 30 * 60
    MAX_ITEMS = 10

    def get_news(self, anime_id):
        key = f"anime-news:{anime_id}"
        return get_or_set(key, self.CACHE_TIMEOUT, lambda: self._fetch_news(anime_id))

    def get_general_news(self, page=1, query="", tag=""):
        key = f"news:page:{page}:q:{query}:tag:{tag}"
        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_general_news(page, query, tag),
        )

    def _fetch_general_news(self, page, query, tag):
        response = JikanClient().get_general_news(page, query, tag)
        items = []

        for news_item in response.get("items", []):
            item = self._normalize_item(news_item)
            if item:
                items.append(item)

        return {**response, "items": items}

    def _fetch_news(self, anime_id):
        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/news",
            params={"sfw-strict": "true"},
        )
        if not data:
            return []

        items = data.get("data")
        if not isinstance(items, list):
            return []

        return [
            item
            for item in (self._normalize_item(news_item) for news_item in items[:self.MAX_ITEMS])
            if item
        ]

    @staticmethod
    def _normalize_item(item):
        if not isinstance(item, dict):
            return None

        title = str(item.get("title") or "").strip()
        url = str(item.get("url") or "").strip()
        if not title or not url:
            return None

        images = item.get("images") or {}
        image = (
            images.get("jpg", {}).get("image_url")
            or images.get("webp", {}).get("image_url")
        )
        anime = item.get("anime") or item.get("entry") or {}
        if isinstance(anime, list):
            anime = anime[0] if anime else {}

        return {
            "title": title,
            "url": url,
            "date": item.get("date"),
            "author": str(item.get("author_username") or "").strip() or None,
            "image": image,
            "anime_id": anime.get("mal_id"),
            "anime_title": anime.get("title"),
        }
