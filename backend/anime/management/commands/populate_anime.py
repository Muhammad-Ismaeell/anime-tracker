
import time

from django.core.management.base import BaseCommand

from anime.application.anime_service import AnimeService
from anime.infrastructure.jikan.jikan_client import (
    JikanClient,
    is_nsfw,
)
from anime.infrastructure.models import Anime


class Command(BaseCommand):

    help = "Populate anime database from Jikan"

    def add_arguments(self, parser):

        parser.add_argument(
            "--max-pages",
            type=int,
            default=200,
            help=(
                "Maximum number of Jikan pages "
                "to process. 25 anime per page."
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

            # ======================================
            # NSFW FILTER
            # ======================================

            if is_nsfw(anime):

                blocked_count += 1

                continue

            # ======================================
            # SAVE
            # ======================================

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
    # FETCH GENERAL CATALOG
    # ==============================================

    def populate_catalog(
        self,
        client,
        service,
        max_pages,
        delay,
    ):

        total_new = 0
        total_updated = 0
        total_blocked = 0
        total_failed = 0

        page = 1

        while page <= max_pages:

            self.stdout.write(
                f"Fetching catalog page {page}..."
            )

            response = client.get_all_anime(
                page
            )

            if not response:

                self.stdout.write(
                    self.style.WARNING(
                        f"Page {page} failed."
                    )
                )

                break

            # ======================================
            # RAW JIKAN DATA
            # ======================================

            items = response.get(
                "items",
                []
            )

            has_next = response.get(
                "has_next",
                False
            )

            total_available = response.get(
                "total",
                0
            )

            # ======================================
            # API ACTUALLY RETURNED NO DATA
            # ======================================

            if not items:

                self.stdout.write(
                    self.style.WARNING(
                        f"Jikan returned no items "
                        f"for page {page}."
                    )
                )

                if not has_next:
                    break

                page += 1

                time.sleep(delay)

                continue

            # ======================================
            # SAVE SAFE ITEMS
            # ======================================

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

            # ======================================
            # PROGRESS
            # ======================================

            if total_available:

                self.stdout.write(
                    f"Jikan catalog: "
                    f"{total_available} anime available"
                )

            # ======================================
            # PAGINATION
            # ======================================

            if not has_next:

                self.stdout.write(
                    "Reached the last Jikan page."
                )

                break

            page += 1

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

        self.stdout.write(
            self.style.HTTP_INFO(
                "\n===================================="
            )
        )

        self.stdout.write(
            self.style.HTTP_INFO(
                "      JIKAN ANIME POPULATION"
            )
        )

        self.stdout.write(
            self.style.HTTP_INFO(
                "===================================="
            )
        )

        self.stdout.write(
            f"Maximum pages: {max_pages}"
        )

        self.stdout.write(
            f"Anime per page: 25"
        )

        self.stdout.write(
            f"Maximum requested: "
            f"{max_pages * 25} anime"
        )

        self.stdout.write(
            f"Request delay: {delay}s\n"
        )

        # ==========================================
        # POPULATE GENERAL CATALOG
        # ==========================================

        (
            total_new,
            total_updated,
            total_blocked,
            total_failed,
        ) = self.populate_catalog(
            client=client,
            service=service,
            max_pages=max_pages,
            delay=delay,
        )

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

