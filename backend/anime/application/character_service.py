from concurrent.futures import ThreadPoolExecutor

from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, JikanClient, safe_request


class CharacterService:
    CACHE_TIMEOUT = 60 * 60
    SAFETY_CACHE_TIMEOUT = 6 * 60 * 60
    SAFETY_WORKERS = 4

    def get_characters(self, anime_id):
        key = f"anime-characters:{anime_id}"
        return get_or_set(key, self.CACHE_TIMEOUT, lambda: self._fetch_characters(anime_id))

    def get_general_characters(self, page=1, query="", order_by="favorites", sort="desc", letter=""):
        key = f"characters:page:{page}:q:{query}:order:{order_by}:sort:{sort}:letter:{letter}"
        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_general_characters(page, query, order_by, sort, letter),
        )

    def _fetch_general_characters(self, page, query, order_by, sort, letter):
        response = JikanClient().get_general_characters(page, query, order_by, sort, letter)
        characters = [
            character
            for character in response.get("items", [])
            if character.get("mal_id")
        ]
        character_ids = [character["mal_id"] for character in characters]

        with ThreadPoolExecutor(max_workers=self.SAFETY_WORKERS) as executor:
            safe_flags = executor.map(self._has_safe_anime, character_ids)
            items = [
                self._normalize_character(character)
                for character, is_safe in zip(characters, safe_flags)
                if is_safe
            ]

        return {**response, "items": items}

    @staticmethod
    def _normalize_character(character):
        images = character.get("images") or {}
        jpg = images.get("jpg") or {}
        webp = images.get("webp") or {}

        return {
            "id": character["mal_id"],
            "name": character.get("name") or "Unknown Character",
            "image": jpg.get("image_url") or webp.get("image_url") or "",
            "favorites": character.get("favorites") or 0,
        }

    def _has_safe_anime(self, character_id):
        key = f"character-safe:{character_id}"
        return get_or_set(
            key,
            self.SAFETY_CACHE_TIMEOUT,
            lambda: bool(JikanClient().get_character_anime(character_id)),
        )

    def _fetch_characters(self, anime_id):
        data = safe_request(f"{BASE_URL}/anime/{anime_id}/characters")
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
                    voice_actors.append({"name": name, "language": voice_actor.get("language")})

            items.append({
                "id": character_id,
                "name": character.get("name") or "Unknown Character",
                "image": jpg.get("image_url") or webp.get("image_url") or "",
                "role": entry.get("role") or "",
                "favorites": character.get("favorites") or 0,
                "voice_actors": voice_actors,
            })

        return items
