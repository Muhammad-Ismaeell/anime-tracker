from datetime import timedelta

from django.utils import timezone

from anime.infrastructure.cache import get_or_set
from anime.infrastructure.jikan.jikan_client import BASE_URL, safe_request
from anime.infrastructure.models import Anime, AnimeStaff, StaffPerson


class StaffService:
    CACHE_TIMEOUT = 60 * 60
    DB_REFRESH_TIMEOUT = timedelta(days=30)

    def get_staff(self, anime_id):
        key = f"anime-staff:v2:{anime_id}"

        return get_or_set(
            key,
            self.CACHE_TIMEOUT,
            lambda: self._get_or_fetch_staff(anime_id),
        )

    def _get_or_fetch_staff(self, anime_id):
        anime = Anime.objects.filter(mal_id=anime_id).first()
        if anime:
            cutoff = timezone.now() - self.DB_REFRESH_TIMEOUT
            rows = list(
                AnimeStaff.objects.select_related("person").filter(
                    anime=anime,
                    last_synced__gte=cutoff,
                ).order_by("person__name")
            )
            if rows:
                return self._serialize(rows)

        return self._fetch_and_store_staff(anime_id, anime)

    def _fetch_and_store_staff(self, anime_id, anime=None):
        data = safe_request(f"{BASE_URL}/anime/{anime_id}/staff")
        if not data:
            return []

        anime = anime or Anime.objects.filter(mal_id=anime_id).first()
        if not anime:
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
                "image": jpg.get("image_url") or webp.get("image_url") or "",
                "positions": positions,
                "favorites": entry.get("favorites") or 0,
            })

        AnimeStaff.objects.filter(anime=anime).delete()
        staff_rows = []
        for item in items:
            staff_person, _ = StaffPerson.objects.update_or_create(
                mal_id=item["id"],
                defaults={
                    "name": item["name"],
                    "image": item["image"],
                    "favorites": item["favorites"],
                },
            )
            staff_rows.append(
                AnimeStaff(
                    anime=anime,
                    person=staff_person,
                    positions=item["positions"],
                )
            )

        if staff_rows:
            AnimeStaff.objects.bulk_create(staff_rows)

        return items

    @staticmethod
    def _serialize(rows):
        return [
            {
                "id": row.person.mal_id,
                "name": row.person.name,
                "image": row.person.image,
                "positions": row.positions,
                "favorites": row.person.favorites,
            }
            for row in rows
        ]
