import time

from django.core.management.base import BaseCommand

from anime.application.anime_service import AnimeService
from anime.infrastructure.jikan.jikan_client import JikanClient
from anime.infrastructure.models import Anime


class Command(BaseCommand):
    help = "Populate a broad anime catalogue from Jikan."

    SOURCES = {
        "top": "get_top",
        "seasonal": "get_seasonal",
        "upcoming": "get_upcoming",
        "airing": "get_airing",
        "movies": "get_movies",
        "ova": "get_ova",
        "ona": "get_ona",
    }

    def add_arguments(self, parser):
        parser.add_argument(
            "--pages",
            type=int,
            default=3,
            help="Pages to fetch from each source.",
        )

        parser.add_argument(
            "--delay",
            type=float,
            default=3,
            help="Delay between requests in seconds.",
        )

    def handle(self, *args, **options):
        pages = options["pages"]
        delay = options["delay"]

        client = JikanClient()
        service = AnimeService(client)

        created = 0
        updated = 0
        skipped = 0

        for source_name, method_name in self.SOURCES.items():

            self.stdout.write("")
            self.stdout.write(
                self.style.MIGRATE_HEADING(
                    f"Fetching {source_name}..."
                )
            )

            fetch_page = getattr(
                client,
                method_name,
            )

            for page in range(1, pages + 1):

                self.stdout.write(
                    f"{source_name}: page {page}/{pages}"
                )

                response = fetch_page(page)

                if not response:
                    self.stdout.write(
                        self.style.WARNING(
                            "No response."
                        )
                    )
                    break

                items = response.get(
                    "items",
                    []
                )

                if not items:
                    self.stdout.write(
                        self.style.WARNING(
                            "No anime returned."
                        )
                    )
                    break

                page_created = 0
                page_updated = 0

                for anime in items:

                    mal_id = anime.get("mal_id")

                    if not mal_id:
                        skipped += 1
                        continue

                    existed = Anime.objects.filter(
                        mal_id=mal_id
                    ).exists()

                    try:
                        service.save_anime(anime)

                    except Exception as exc:
                        skipped += 1

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
                        f"+{page_created} created | "
                        f"{page_updated} updated"
                    )
                )

                if not response.get(
                    "has_next",
                    False,
                ):
                    break

                if delay:
                    time.sleep(delay)

        self.stdout.write("")
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "CATALOG POPULATION COMPLETE"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Updated: {updated}"
            )
        )

        self.stdout.write(
            self.style.WARNING(
                f"Skipped: {skipped}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Database total: {Anime.objects.count()}"
            )
        )