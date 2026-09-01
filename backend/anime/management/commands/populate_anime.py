
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
            default=5,
            help=(
                "Maximum number of pages to process "
                "for each source."
            ),
        )

        parser.add_argument(
            "--delay",
            type=float,
            default=1.5,
            help=(
                "Delay between Jikan requests "
                "in seconds."
            ),
        )

    # ==============================================
    # SAVE ITEMS
    # ==============================================

    def save_items(
        self,
        items,
        service,
    ):

        new_count = 0
        update_count = 0
        blocked_count = 0
        fail_count = 0

        for anime in items:

            if is_nsfw(anime):

                blocked_count += 1
                continue

            try:

                _, created = service.save_anime(
                    anime
                )

                if created:
                    new_count += 1
                else:
                    update_count += 1

            except Exception as exc:

                fail_count += 1

                self.stdout.write(
                    self.style.WARNING(
                        f"Failed: "
                        f"{anime.get('title')} - "
                        f"{exc}"
                    )
                )

        return (
            new_count,
            update_count,
            blocked_count,
            fail_count,
        )

    # ==============================================
    # POPULATE ONE SOURCE
    # ==============================================

    def populate_source(
        self,
        name,
        fetcher,
        service,
        max_pages,
        delay,
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

            response = fetcher(page)

            if not response:

                self.stdout.write(
                    self.style.WARNING(
                        f"{name} page {page} failed."
                    )
                )

                break

            items = response.get(
                "items",
                [],
            )

            has_next = response.get(
                "has_next",
                False,
            )

            if not items:

                self.stdout.write(
                    f"No items returned for "
                    f"{name} page {page}."
                )

                break

            (
                new_count,
                update_count,
                blocked_count,
                fail_count,
            ) = self.save_items(
                items,
                service,
            )

            total_new += new_count
            total_updated += update_count
            total_blocked += blocked_count
            total_failed += fail_count

            self.stdout.write(
                f"Page {page}: "
                f"{new_count} new, "
                f"{update_count} updated, "
                f"{blocked_count} blocked, "
                f"{fail_count} failed"
            )

            if not has_next:

                self.stdout.write(
                    f"Reached the last {name} page."
                )

                break

            time.sleep(delay)

        return (
            total_new,
            total_updated,
            total_blocked,
            total_failed,
        )

    # ==============================================
    # HANDLE
    # ==============================================

    def handle(
        self,
        *args,
        **options,
    ):

        client = JikanClient()

        service = AnimeService(
            client
        )

        max_pages = options[
            "max_pages"
        ]

        delay = options[
            "delay"
        ]

        sources = [
            (
                "Top Anime",
                client.get_top,
            ),
            (
                "Seasonal Anime",
                client.get_seasonal,
            ),
            (
                "Upcoming Anime",
                client.get_upcoming,
            ),
            (
                "Currently Airing",
                client.get_airing,
            ),
            (
                "Movies",
                client.get_movies,
            ),
            (
                "OVA",
                client.get_ova,
            ),
            (
                "ONA",
                client.get_ona,
            ),
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

        self.stdout.write(
            f"Sources: {len(sources)}"
        )

        self.stdout.write(
            f"Maximum pages per source: "
            f"{max_pages}"
        )

        self.stdout.write(
            f"Delay between requests: "
            f"{delay}s"
        )

        # ==========================================
        # POPULATE ALL SOURCES
        # ==========================================

        for name, fetcher in sources:

            (
                new_count,
                update_count,
                blocked_count,
                fail_count,
            ) = self.populate_source(
                name=name,
                fetcher=fetcher,
                service=service,
                max_pages=max_pages,
                delay=delay,
            )

            total_new += new_count
            total_updated += update_count
            total_blocked += blocked_count
            total_failed += fail_count

        # ==========================================
        # FINAL RESULT
        # ==========================================

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

        self.stdout.write(
            f"New anime: {total_new}"
        )

        self.stdout.write(
            f"Updated anime: {total_updated}"
        )

        self.stdout.write(
            f"Blocked by NSFW filter: "
            f"{total_blocked}"
        )

        self.stdout.write(
            f"Failed: {total_failed}"
        )

        self.stdout.write(
            f"Total in database: "
            f"{Anime.objects.count()}"
        )

        self.stdout.write(
            self.style.SUCCESS(
                "===================================="
            )
        )
