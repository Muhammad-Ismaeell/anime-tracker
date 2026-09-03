import time

from django.core.management.base import BaseCommand

from anime.application.anime_service import AnimeService
from anime.infrastructure.jikan.jikan_client import (
    JikanClient,
    is_nsfw,
)
from anime.infrastructure.models import Anime


class Command(BaseCommand):

    help = "Populate anime database from multiple Jikan sources"

    def add_arguments(self, parser):

        parser.add_argument(
            "--max-pages",
            type=int,
            default=10,
            help="Maximum number of pages for specialized sources.",
        )

        parser.add_argument(
            "--catalog-pages",
            type=int,
            default=100,
            help="Maximum number of pages for the general anime catalog.",
        )

        parser.add_argument(
            "--delay",
            type=float,
            default=3,
            help="Delay between Jikan requests in seconds.",
        )

        parser.add_argument(
            "--source-delay",
            type=float,
            default=10,
            help="Cooldown between different Jikan sources in seconds.",
        )

        parser.add_argument(
            "--request-retries",
            type=int,
            default=2,
            help="Additional retries when a Jikan page request returns no data.",
        )

    def save_items(self, items, service):

        new_count = 0
        update_count = 0
        blocked_count = 0
        fail_count = 0

        for anime in items:

            if is_nsfw(anime):
                blocked_count += 1
                continue

            try:
                _, created = service.save_anime(anime)

                if created:
                    new_count += 1
                else:
                    update_count += 1

            except Exception as exc:
                fail_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f"Failed: {anime.get('title')} - {exc}"
                    )
                )

        return new_count, update_count, blocked_count, fail_count

    def fetch_page(self, name, fetcher, page, request_retries):

        attempts = request_retries + 1

        for attempt in range(1, attempts + 1):

            response = fetcher(page)

            if response and response.get("items"):
                return response

            if attempt < attempts:
                wait = 2 ** (attempt - 1)

                self.stdout.write(
                    self.style.WARNING(
                        f"{name} page {page} returned no data. "
                        f"Retrying in {wait}s ({attempt}/{request_retries})..."
                    )
                )

                time.sleep(wait)

        return None

    def populate_source(
        self,
        name,
        fetcher,
        service,
        max_pages,
        delay,
        request_retries,
        continue_after_failure=False,
    ):

        total_new = 0
        total_updated = 0
        total_blocked = 0
        total_failed = 0

        self.stdout.write(
            self.style.HTTP_INFO(
                f"\n========== {name.upper()} =========="
            )
        )

        for page in range(1, max_pages + 1):

            self.stdout.write(
                f"Fetching {name} page {page}..."
            )

            response = self.fetch_page(
                name=name,
                fetcher=fetcher,
                page=page,
                request_retries=request_retries,
            )

            if not response:
                self.stdout.write(
                    self.style.WARNING(
                        f"Skipping {name} page {page} after "
                        f"{request_retries + 1} attempts."
                    )
                )

                # A transient failure in the large catalog should not
                # prevent later pages from being populated.
                if continue_after_failure:
                    time.sleep(delay)
                    continue

                break

            items = response.get("items", [])
            has_next = response.get("has_next", False)

            if not items:
                self.stdout.write(
                    f"No items returned for {name} page {page}."
                )
                break

            (
                new_count,
                update_count,
                blocked_count,
                fail_count,
            ) = self.save_items(items, service)

            total_new += new_count
            total_updated += update_count
            total_blocked += blocked_count
            total_failed += fail_count

            self.stdout.write(
                f"Page {page}: {new_count} new, {update_count} updated, "
                f"{blocked_count} blocked, {fail_count} failed"
            )

            if not has_next:
                self.stdout.write(
                    f"Reached the last {name} page."
                )
                break

            time.sleep(delay)

        return total_new, total_updated, total_blocked, total_failed

    def handle(self, *args, **options):

        client = JikanClient()
        service = AnimeService(client)

        max_pages = options["max_pages"]
        catalog_pages = options["catalog_pages"]
        delay = options["delay"]
        source_delay = options["source_delay"]
        request_retries = options["request_retries"]

        # The general catalog is the main population source because it
        # provides much more coverage than category-specific endpoints.
        # Seasonal remains first so current-season data is available even
        # when Jikan later becomes unreliable for deeper catalog pages.
        sources = [
            ("Seasonal Anime", client.get_seasonal, max_pages, False),
            ("Top Anime", client.get_top, max_pages, False),
            ("All Anime", client.get_all_anime, catalog_pages, True),
            ("Upcoming Anime", client.get_upcoming, max_pages, False),
            ("Currently Airing", client.get_airing, max_pages, False),
            ("Movies", client.get_movies, max_pages, False),
            ("OVA", client.get_ova, max_pages, False),
            ("ONA", client.get_ona, max_pages, False),
        ]

        total_new = 0
        total_updated = 0
        total_blocked = 0
        total_failed = 0

        self.stdout.write(
            self.style.HTTP_INFO(
                "\n===================================="
            )
        )
        self.stdout.write(
            self.style.HTTP_INFO(
                "       JIKAN ANIME POPULATION"
            )
        )
        self.stdout.write(
            self.style.HTTP_INFO(
                "===================================="
            )
        )
        self.stdout.write(f"Sources: {len(sources)}")
        self.stdout.write(f"Specialized source pages: {max_pages}")
        self.stdout.write(f"General catalog pages: {catalog_pages}")
        self.stdout.write(f"Delay between requests: {delay}s")
        self.stdout.write(f"Delay between sources: {source_delay}s")
        self.stdout.write(f"Retries per failed page: {request_retries}")

        for index, (name, fetcher, page_limit, continue_after_failure) in enumerate(sources):

            (
                new_count,
                update_count,
                blocked_count,
                fail_count,
            ) = self.populate_source(
                name=name,
                fetcher=fetcher,
                service=service,
                max_pages=page_limit,
                delay=delay,
                request_retries=request_retries,
                continue_after_failure=continue_after_failure,
            )

            total_new += new_count
            total_updated += update_count
            total_blocked += blocked_count
            total_failed += fail_count

            if index < len(sources) - 1:
                self.stdout.write(
                    f"\nCooling down for {source_delay}s before the next source..."
                )
                time.sleep(source_delay)

        self.stdout.write("\n")
        self.stdout.write(
            self.style.SUCCESS(
                "===================================="
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "Population finished."
            )
        )
        self.stdout.write(f"New anime: {total_new}")
        self.stdout.write(f"Updated anime: {total_updated}")
        self.stdout.write(f"Blocked by NSFW filter: {total_blocked}")
        self.stdout.write(f"Failed: {total_failed}")
        self.stdout.write(f"Total in database: {Anime.objects.count()}")
        self.stdout.write(
            self.style.SUCCESS(
                "===================================="
            )
        )
