import time

from django.core.management.base import BaseCommand, CommandError

from anime.application.anime_service import AnimeService
from anime.infrastructure.jikan.jikan_client import JikanClient
from anime.infrastructure.models import Anime


class Command(BaseCommand):
    help = (
        "Populate the Anime database from Jikan using paginated "
        "top or seasonal anime results."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--source",
            type=str,
            choices=["top", "seasonal"],
            default="top",
            help="Jikan source to use. Default: top",
        )

        parser.add_argument(
            "--pages",
            type=int,
            default=20,
            help=(
                "Maximum number of pages to fetch. "
                "Each Jikan page contains up to 25 anime. "
                "Default: 20"
            ),
        )

        parser.add_argument(
            "--delay",
            type=float,
            default=1.0,
            help=(
                "Delay in seconds between Jikan page requests. "
                "Default: 1.0"
            ),
        )

    def handle(self, *args, **options):
        source = options["source"]
        max_pages = options["pages"]
        delay = options["delay"]

        if max_pages < 1:
            raise CommandError("--pages must be at least 1.")

        if delay < 0:
            raise CommandError("--delay cannot be negative.")

        client = JikanClient()
        service = AnimeService(client)

        if source == "top":
            fetch_page = client.get_top
            source_label = "top anime"
        elif source == "seasonal":
            fetch_page = client.get_seasonal
            source_label = "current seasonal anime"
        else:
            raise CommandError(
                f"Unsupported source: {source}"
            )

        self.stdout.write("")
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                f"Seeding anime from Jikan: {source_label}"
            )
        )
        self.stdout.write(
            f"Maximum pages: {max_pages}"
        )
        self.stdout.write(
            f"Delay between pages: {delay:.1f}s"
        )
        self.stdout.write("")

        total_processed = 0
        total_created = 0
        total_updated = 0
        total_skipped = 0

        for page in range(1, max_pages + 1):
            self.stdout.write(
                self.style.HTTP_INFO(
                    f"Fetching page {page}/{max_pages}..."
                )
            )

            result = fetch_page(page)

            if not result:
                self.stdout.write(
                    self.style.ERROR(
                        f"Page {page}: Jikan returned no data."
                    )
                )
                break

            items = result.get("items", [])
            has_next = result.get("has_next", False)

            if not items:
                self.stdout.write(
                    self.style.WARNING(
                        f"Page {page}: no anime returned."
                    )
                )
                break

            page_created = 0
            page_updated = 0
            page_skipped = 0

            for raw_anime in items:
                mal_id = raw_anime.get("mal_id")

                if not mal_id:
                    page_skipped += 1
                    continue

                exists = Anime.objects.filter(
                    mal_id=mal_id
                ).exists()

                try:
                    service.save_anime(raw_anime)
                except Exception as exc:
                    page_skipped += 1

                    self.stdout.write(
                        self.style.WARNING(
                            f"Skipped MAL ID {mal_id}: {exc}"
                        )
                    )

                    continue

                if exists:
                    page_updated += 1
                else:
                    page_created += 1

            page_processed = (
                page_created
                + page_updated
            )

            total_processed += page_processed
            total_created += page_created
            total_updated += page_updated
            total_skipped += page_skipped

            self.stdout.write(
                self.style.SUCCESS(
                    f"Page {page}: "
                    f"{page_processed} processed | "
                    f"{page_created} created | "
                    f"{page_updated} updated | "
                    f"{page_skipped} skipped"
                )
            )

            self.stdout.write(
                f"Database total: {Anime.objects.count()}"
            )

            if not has_next:
                self.stdout.write("")
                self.stdout.write(
                    self.style.WARNING(
                        "Jikan reports no more pages."
                    )
                )
                break

            if page < max_pages and delay > 0:
                time.sleep(delay)

            self.stdout.write("")

        self.stdout.write("")
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "Seeding complete"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Processed: {total_processed}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created:   {total_created}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Updated:   {total_updated}"
            )
        )

        self.stdout.write(
            self.style.WARNING(
                f"Skipped:   {total_skipped}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Database total: {Anime.objects.count()}"
            )
        )

        self.stdout.write("")