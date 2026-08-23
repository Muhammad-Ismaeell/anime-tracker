from django.core.management.base import BaseCommand

from anime.application.anime_service import AnimeService
from anime.infrastructure.jikan.jikan_client import (
    JikanClient,
    is_nsfw,
)
from anime.infrastructure.models import Anime


class Command(BaseCommand):
    help = "Sync anime from Jikan into the local database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--pages",
            type=int,
            default=5,
            help="Number of Jikan pages to import.",
        )

    def handle(self, *args, **options):
        pages = options["pages"]

        if pages < 1:
            self.stdout.write(
                self.style.ERROR(
                    "Pages must be at least 1."
                )
            )
            return

        client = JikanClient()
        service = AnimeService(client=None)

        created = 0
        updated = 0
        skipped = 0

        for page in range(1, pages + 1):
            self.stdout.write(
                f"Fetching Jikan page {page}/{pages}..."
            )

            data = client.get_top(page)

            if not data:
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed to fetch page {page}."
                    )
                )
                break

            items = data.get("items", [])

            if not items:
                self.stdout.write(
                    f"Page {page} contains no anime."
                )
                break

            page_created = 0
            page_updated = 0
            page_skipped = 0

            for raw in items:
                if is_nsfw(raw):
                    skipped += 1
                    page_skipped += 1
                    continue

                mal_id = raw.get("mal_id")

                if not mal_id:
                    skipped += 1
                    page_skipped += 1
                    continue

                existed = Anime.objects.filter(
                    mal_id=mal_id
                ).exists()

                try:
                    service.save_anime(raw)
                except Exception as exc:
                    skipped += 1
                    page_skipped += 1

                    self.stdout.write(
                        self.style.WARNING(
                            f"Failed {mal_id}: {exc}"
                        )
                    )
                    continue

                if existed:
                    updated += 1
                    page_updated += 1
                else:
                    created += 1
                    page_created += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"Page {page}: "
                    f"{len(items)} processed | "
                    f"+{page_created} created | "
                    f"{page_updated} updated | "
                    f"{page_skipped} skipped"
                )
            )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "SYNC COMPLETE"
            )
        )

        self.stdout.write(
            f"Created: {created}"
        )

        self.stdout.write(
            f"Updated: {updated}"
        )

        self.stdout.write(
            f"Skipped: {skipped}"
        )

        self.stdout.write(
            f"Total anime in database: "
            f"{Anime.objects.count()}"
        )