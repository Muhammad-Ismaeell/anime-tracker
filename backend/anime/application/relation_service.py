from datetime import timedelta

from django.utils import timezone

from anime.infrastructure.cache import get_or_set
from anime.infrastructure.db_write_lock import db_write_lock
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request
from anime.infrastructure.models import Anime, AnimeRelation


class RelationService:
    CACHE_TIMEOUT = 60 * 60
    DB_REFRESH_TIMEOUT = timedelta(days=30)

    def get_relations(self, anime_id):
        key = f"anime-relations:v2:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._get_or_fetch_relations(anime_id),
        )

    def _get_or_fetch_relations(self, anime_id):
        anime = Anime.objects.filter(mal_id=anime_id).first()
        if anime:
            cutoff = timezone.now() - self.DB_REFRESH_TIMEOUT
            rows = list(
                AnimeRelation.objects.filter(
                    anime=anime,
                    last_synced__gte=cutoff,
                ).order_by("relation_type", "related_title")
            )
            if rows:
                return self._serialize(rows)

        return self._fetch_and_store_relations(anime_id, anime)

    def _fetch_and_store_relations(self, anime_id, anime=None):
        data = safe_request(f"{BASE_URL}/anime/{anime_id}/relations")
        if not data:
            return []

        anime = anime or Anime.objects.filter(mal_id=anime_id).first()
        if not anime:
            return []

        rows = []
        for relation in data.get("data") or []:
            relation_type = relation.get("relation") or "Other"
            for entry in relation.get("entry") or []:
                entry_id = entry.get("mal_id")
                if not entry_id or entry.get("type") != "anime":
                    continue

                rows.append(
                    AnimeRelation(
                        anime=anime,
                        relation_type=relation_type,
                        related_mal_id=entry_id,
                        related_title=entry.get("name") or "Unknown Anime",
                        related_type=entry.get("type") or "anime",
                        related_url=entry.get("url") or "",
                    )
                )

        with db_write_lock:
            AnimeRelation.objects.filter(anime=anime).delete()
            if rows:
                AnimeRelation.objects.bulk_create(rows)

        return self._serialize(rows)

    @staticmethod
    def _serialize(rows):
        grouped = {}
        for row in rows:
            grouped.setdefault(row.relation_type, []).append({
                "id": row.related_mal_id,
                "title": row.related_title,
                "type": row.related_type,
                "url": row.related_url,
            })

        return [
            {"relation": relation, "entries": entries}
            for relation, entries in grouped.items()
        ]
