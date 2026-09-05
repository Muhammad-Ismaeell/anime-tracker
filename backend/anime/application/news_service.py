import hashlib

from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, JikanClient, safe_request


class NewsService:
    CACHE_TIMEOUT = 30 * 60
    MAX_ITEMS = 10
    SEARCH_PAGES = 4
    SEARCH_LIMIT = 50

    def get_news(self, anime_id):
        key = f"anime-news:{anime_id}"
        return get_or_set(key, self.CACHE_TIMEOUT, lambda: self._fetch_news(anime_id))

    def get_general_news(self, page=1, query="", tag=""):
        cache_key = self._cache_key(page, query, tag)
        return get_or_set(
            cache_key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_general_news(page, query, tag),
        )

    def _fetch_general_news(self, page, query, tag):
        search_query = query.casefold().strip()
        response = JikanClient().get_general_news(page, query, tag)

        if not search_query:
            return self._normalize_response(response)

        items = self._filter_title_matches(response.get("items", []), search_query)
        if items:
            return {**response, "items": items}

        return self._search_news_titles(search_query, tag)

    def _search_news_titles(self, search_query, tag):
        client = JikanClient()
        matches = []

        for page in range(1, self.SEARCH_PAGES + 1):
            response = client.get_general_news(
                page,
                tag=tag,
                limit=self.SEARCH_LIMIT,
            )
            page_matches = self._filter_title_matches(response.get("items", []), search_query)
            matches.extend(page_matches)

            if len(matches) >= self.MAX_ITEMS or not response.get("has_next"):
                break

        return {
            "items": matches[:self.MAX_ITEMS],
            "page": 1,
            "has_next": False,
            "total": min(len(matches), self.MAX_ITEMS),
        }

    def _normalize_response(self, response):
        items = [
            item
            for item in (self._normalize_item(news_item) for news_item in response.get("items", []))
            if item
        ]
        return {**response, "items": items}

    def _filter_title_matches(self, raw_items, search_query):
        matches = []
        for news_item in raw_items:
            item = self._normalize_item(news_item)
            if item and search_query in item["title"].casefold():
                matches.append(item)
        return matches

    @staticmethod
    def _cache_key(page, query, tag):
        value = f"{page}|{query.strip().casefold()}|{tag.strip().casefold()}"
        digest = hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]
        return f"news:{digest}"

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
