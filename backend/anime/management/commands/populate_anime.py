from django.core.management.base import BaseCommand

from anime.infrastructure.jikan.jikan_client import JikanClient
from anime.application.anime_service import AnimeService


class Command(BaseCommand):

    help = "Populate anime database from Jikan"


    def save_items(self, items, service):

        saved = 0

        for anime in items:

            try:
                service.save_anime(anime)
                saved += 1

            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(
                        f"Failed: {anime.get('title')} - {e}"
                    )
                )

        return saved


    def handle(self, *args, **options):

        client = JikanClient()
        service = AnimeService(client)

        total_saved = 0


        # ==========================
        # TOP ANIME
        # ==========================

        self.stdout.write(
            "Fetching top anime..."
        )

        for page in range(1, 11):

            self.stdout.write(
                f"Top page {page}"
            )

            response = client.get_top(page)

            items = response.get(
                "items",
                []
            )


            if not items:
                continue


            total_saved += self.save_items(
                items,
                service
            )


        # ==========================
        # CURRENT SEASON
        # ==========================

        self.stdout.write(
            "Fetching current season..."
        )


        for page in range(1,5):

            response = client.get_seasonal(page)

            items = response.get(
                "items",
                []
            )


            if not items:
                continue


            total_saved += self.save_items(
                items,
                service
            )


        self.stdout.write(
            self.style.SUCCESS(
                f"Finished. Saved {total_saved} anime"
            )
        )