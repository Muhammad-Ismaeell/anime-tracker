from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request


class ExternalLinkService:
    CACHE_TIMEOUT = 30 * 60

    def get_links(self, anime_id):
        key = f"anime-external-links:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_links(anime_id),
        )

    def _fetch_links(self, anime_id):
        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/full"
        )

        if not data:
            return []

        anime = data.get("data")
        if not isinstance(anime, dict):
            return []

        links = []

        for item in anime.get("external", []) or []:
            self._append_link(links, item, "External")

        for item in anime.get("streaming", []) or []:
            self._append_link(links, item, "Streaming")

        return links

    @staticmethod
    def _append_link(links, item, category):
        if not isinstance(item, dict):
            return

        name = str(item.get("name") or "").strip()
        url = str(item.get("url") or "").strip()

        if not name or not url:
            return

        if not url.startswith(("http://", "https://")):
            return

        if any(existing["url"] == url for existing in links):
            return

        links.append({
            "name": name,
            "url": url,
            "category": category,
        })
