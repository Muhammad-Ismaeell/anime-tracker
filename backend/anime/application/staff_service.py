from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request


class StaffService:
    CACHE_TIMEOUT = 60 * 60

    def get_staff(self, anime_id):
        key = f"anime-staff:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._fetch_staff(anime_id),
        )

    def _fetch_staff(self, anime_id):
        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/staff"
        )

        if not data:
            return []

        items = []

        for entry in data.get("data") or []:
            person = entry.get("person") or {}
            person_id = person.get("mal_id")

            if not person_id:
                continue

            images = person.get("images") or {}
            jpg = images.get("jpg") or {}
            webp = images.get("webp") or {}

            positions = entry.get("positions") or []
            if isinstance(positions, str):
                positions = [positions]

            items.append({
                "id": person_id,
                "name": person.get("name") or "Unknown Person",
                "image": (
                    jpg.get("image_url")
                    or webp.get("image_url")
                    or ""
                ),
                "positions": positions,
                "favorites": entry.get("favorites") or 0,
            })

        return items
