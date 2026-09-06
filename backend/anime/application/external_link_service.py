from datetime import timedelta

from django.utils import timezone

from anime.infrastructure.cache import get_or_set
from anime.infrastructure.db_write_lock import db_write_lock
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request
from anime.infrastructure.models import Anime, AnimeExternalLink


class ExternalLinkService:
    CACHE_TIMEOUT = 30 * 60
    DB_REFRESH_TIMEOUT = timedelta(days=30)

    def get_links(self, anime_id):
        key = f"anime-external-links:v2:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._get_or_fetch_links(anime_id),
        )

    def _get_or_fetch_links(self, anime_id):
        anime = Anime.objects.filter(mal_id=anime_id).first()
        if anime:
            cutoff = timezone.now() - self.DB_REFRESH_TIMEOUT
            rows = list(
                AnimeExternalLink.objects.filter(
                    anime=anime,
                    last_synced__gte=cutoff,
                ).order_by("category", "name")
            )
            if rows:
                return self._serialize(rows)

        return self._fetch_and_store_links(anime_id, anime)

    def _fetch_and_store_links(self, anime_id, anime=None):
        data = safe_request(f"{BASE_URL}/anime/{anime_id}/full")
        if not data:
            return []

        anime_data = data.get("data")
        if not isinstance(anime_data, dict):
            return []

        anime = anime or Anime.objects.filter(mal_id=anime_id).first()
        if not anime:
            return []

        links = []
        seen_urls = set()

        for item in anime_data.get("external", []) or []:
            self._append_link(links, seen_urls, item, "External")

        for item in anime_data.get("streaming", []) or []:
            self._append_link(links, seen_urls, item, "Streaming")

        rows = [
            AnimeExternalLink(
                anime=anime,
                name=item["name"],
                url=item["url"],
                category=item["category"],
            )
            for item in links
        ]

        with db_write_lock:
            AnimeExternalLink.objects.filter(anime=anime).delete()
            if rows:
                AnimeExternalLink.objects.bulk_create(rows)

        return links

    @staticmethod
    def _append_link(links, seen_urls, item, category):
        if not isinstance(item, dict):
            return

        name = str(item.get("name") or "").strip()
        url = str(item.get("url") or "").strip()

        if not name or not url:
            return
        if not url.startswith(("http://", "https://")):
            return
        if url in seen_urls:
            return

        seen_urls.add(url)
        links.append({
            "name": name,
            "url": url,
            "category": category,
        })

    @staticmethod
    def _serialize(rows):
        return [
            {
                "name": row.name,
                "url": row.url,
                "category": row.category,
            }
            for row in rows
        ]
