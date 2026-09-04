from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request


class RelationService:
    CACHE_TIMEOUT = 60 * 60

    def get_relations(self, anime_id):
        key = f"anime-relations:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_relations(anime_id),
        )

    def _fetch_relations(self, anime_id):
        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/relations"
        )

        if not data:
            return []

        relations = []

        for relation in data.get("data") or []:
            relation_type = relation.get("relation") or "Other"
            entries = []

            for entry in relation.get("entry") or []:
                entry_id = entry.get("mal_id")

                if not entry_id or entry.get("type") != "anime":
                    continue

                entries.append({
                    "id": entry_id,
                    "title": entry.get("name") or "Unknown Anime",
                    "type": entry.get("type") or "anime",
                    "url": entry.get("url") or "",
                })

            if entries:
                relations.append({
                    "relation": relation_type,
                    "entries": entries,
                })

        return relations
