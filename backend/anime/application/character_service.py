from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request


class CharacterService:
    CACHE_TIMEOUT = 60 * 60

    def get_characters(self, anime_id):
        key = f"anime-characters:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_characters(anime_id),
        )

    def _fetch_characters(self, anime_id):
        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/characters"
        )

        if not data:
            return []

        items = []

        for entry in data.get("data") or []:
            character = entry.get("character") or {}
            character_id = character.get("mal_id")

            if not character_id:
                continue

            images = character.get("images") or {}
            jpg = images.get("jpg") or {}
            webp = images.get("webp") or {}

            voice_actors = []
            for voice_actor in entry.get("voice_actors") or []:
                person = voice_actor.get("person") or {}
                name = person.get("name")
                if name:
                    voice_actors.append({
                        "name": name,
                        "language": voice_actor.get("language"),
                    })

            items.append({
                "id": character_id,
                "name": character.get("name") or "Unknown Character",
                "image": (
                    jpg.get("image_url")
                    or webp.get("image_url")
                    or ""
                ),
                "role": entry.get("role") or "",
                "favorites": entry.get("favorites") or 0,
                "voice_actors": voice_actors,
            })

        return items
