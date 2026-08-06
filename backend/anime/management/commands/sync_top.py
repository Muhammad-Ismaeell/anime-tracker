from django.core.management.base import BaseCommand

from anime.infrastructure.jikan.jikan_client import JikanClient
from anime.infrastructure.models import Anime


class Command(BaseCommand):

    help = "Sync top anime from Jikan into database"


    def handle(self, *args, **options):

        client = JikanClient()

        page = 1
        created = 0
        updated = 0


        while True:

            print(f"Syncing page {page}")

            data = client.get_top(page)


            items = data.get(
                "items",
                []
            )


            if not items:
                break


            for item in items:

                mal_id = item.get("mal_id")

                if not mal_id:
                    continue


                anime, is_created = Anime.objects.update_or_create(

                    mal_id=mal_id,

                    defaults={

                        "title":
                            item.get("title"),

                        "search_title":
                            item.get("title", "")
                            .lower(),

                        "image":
                            item.get("images", {})
                            .get("jpg", {})
                            .get("image_url"),

                        "image_large":
                            item.get("images", {})
                            .get("jpg", {})
                            .get("large_image_url"),

                        "score":
                            item.get("score"),

                        "popularity":
                            item.get("popularity"),

                        "type":
                            item.get("type"),

                        "episodes":
                            item.get("episodes"),

                        "year":
                            item.get("year"),

                        "season":
                            item.get("season"),
                    }
                )


                if is_created:
                    created += 1
                else:
                    updated += 1


            if not data.get(
                "has_next",
                False
            ):
                break


            page += 1



        self.stdout.write(
            self.style.SUCCESS(
                f"""
Sync finished

Created: {created}
Updated: {updated}

Total anime:
{Anime.objects.count()}
"""
            )
        )