from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta

from django.utils import timezone

from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, JikanClient, safe_request
from anime.infrastructure.models import CharacterSafety


class CharacterService:
    CACHE_TIMEOUT = 60 * 60
    SAFETY_CACHE_TIMEOUT = 7 * 24 * 60 * 60
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
        safe_flags = self._get_safe_flags(character_ids)

        items = [
            self._normalize_character(character)
            for character in characters
            if safe_flags.get(character["mal_id"], False)
        ]

        return {**response, "items": items}

    def _get_safe_flags(self, character_ids):
        if not character_ids:
            return {}

        now = timezone.now()
        cutoff = now - timedelta(seconds=self.SAFETY_CACHE_TIMEOUT)
        cached = {
            safety.mal_id: safety.is_safe
            for safety in CharacterSafety.objects.filter(
                mal_id__in=character_ids,
                checked_at__gte=cutoff,
            )
        }
        missing_ids = [character_id for character_id in character_ids if character_id not in cached]

        if missing_ids:
            with ThreadPoolExecutor(max_workers=self.SAFETY_WORKERS) as executor:
                results = executor.map(self._check_character_safety, missing_ids)
                safety_records = [
                    CharacterSafety(mal_id=character_id, is_safe=is_safe)
                    for character_id, is_safe in zip(missing_ids, results)
                ]

            for record in safety_records:
                CharacterSafety.objects.update_or_create(
                    mal_id=record.mal_id,
                    defaults={"is_safe": record.is_safe},
                )
                cached[record.mal_id] = record.is_safe

        return cached

    @staticmethod
    def _check_character_safety(character_id):
        return bool(JikanClient().get_character_anime(character_id))

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
