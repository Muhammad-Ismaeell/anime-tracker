from django.core.management.base import BaseCommand

from anime.infrastructure.jikan.jikan_client import JikanClient
from anime.application.anime_service import AnimeService


class Command(BaseCommand):

    help = "Populate current seasonal anime"

    def handle(self, *args, **options):

        client = JikanClient()
        service = AnimeService(client)

        total_saved = 0

        for page in range(1, 6):

            self.stdout.write(
                f"Fetching seasonal page {page}"
            )

            response = client.get_seasonal(page)

            items = response.get(
                "items",
                []
            )

            if not items:
                self.stdout.write(
                    "No more seasonal anime"
                )
                break


            for anime in items:

                try:
                    service.save_anime(anime)

                    total_saved += 1

                    self.stdout.write(
                        f"Saved: {anime.get('title')}"
                    )

                except Exception as e:

                    self.stdout.write(
                        self.style.WARNING(
                            str(e)
                        )
                    )


        self.stdout.write(
            self.style.SUCCESS(
                f"Saved {total_saved} seasonal anime"
            )
        )