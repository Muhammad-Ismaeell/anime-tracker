from django.core.management.base import BaseCommand

from anime.infrastructure.jikan.jikan_client import JikanClient
from anime.infrastructure.models import Anime


class Command(BaseCommand):
    help = "Sync top anime from Jikan into database"

    MAX_PAGES = 5

    def handle(self, *args, **options):
        client = JikanClient()

        created = 0
        updated = 0

        for page in range(1, self.MAX_PAGES + 1):
            self.stdout.write(f"Syncing page {page}")

            data = client.get_top(page)

            if not data:
                self.stdout.write(
                    self.style.ERROR(
                        f"Jikan returned no data for page {page}."
                    )
                )
                break

            items = data.get("items", [])

            if not items:
                break

            for item in items:
                mal_id = item.get("id")

                if not mal_id:
                    continue

                _, is_created = Anime.objects.update_or_create(
                    mal_id=mal_id,
                    defaults={
                        "title": item.get("title") or "",
                        "search_title": (
                            item.get("title") or ""
                        ).lower(),
                        "image": item.get("image"),
                        "image_large": None,
                        "score": item.get("score"),
                        "popularity": item.get("popularity"),
                        "type": item.get("type"),
                        "episodes": item.get("episodes"),
                        "year": item.get("year"),
                        "season": item.get("season"),
                    },
                )

                if is_created:
                    created += 1
                else:
                    updated += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"Page {page}: {len(items)} anime processed."
                )
            )

            if not data.get("has_next", False):
                break

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSync finished\n\n"
                f"Created: {created}\n"
                f"Updated: {updated}\n\n"
                f"Total anime:\n{Anime.objects.count()}"
            )
        )