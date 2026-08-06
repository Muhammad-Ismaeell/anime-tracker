from django.core.management.base import BaseCommand

from anime.infrastructure.models import Anime

from anime.infrastructure.jikan.jikan_client import JikanClient

import time



class Command(BaseCommand):

    help = "Sync anime cards from Jikan"



    def handle(self, *args, **kwargs):

        client = JikanClient()


        total_saved = 0



        for page in range(1, 20):

            self.stdout.write(
                f"Fetching page {page}"
            )


            data = client.get_top(
                page
            )


            items = data.get(
                "items",
                []
            )


            if not items:

                self.stdout.write(
                    "No items"
                )

                continue



            for anime in items:


                mal_id = anime.get(
                    "mal_id"
                )


                self.stdout.write(
                    f"Saving {mal_id}"
                )


                images = (
                    anime.get(
                        "images",
                        {}
                    )
                    .get(
                        "jpg",
                        {}
                    )
                )


                try:
                    Anime.objects.update_or_create(

                        mal_id=mal_id,


                        defaults={

                            "title":
                                anime.get("title") or "",


                            "title_english":
                                anime.get("title_english") or "",


                            "search_title":
                                (
                                    anime.get("title")
                                    or ""
                                ).lower(),


                            "image":
                                images.get("image_url"),


                            "image_large":
                                images.get("large_image_url"),


                            "score":
                                anime.get("score"),


                            "popularity":
                                anime.get("popularity"),


                            "type":
                                anime.get("type"),


                            "episodes":
                                anime.get("episodes"),


                            "year":
                                anime.get("year"),


                            "season":
                                anime.get("season"),


                            "status":
                                anime.get("status") or "",


                            "rating":
                                anime.get("rating") or "",

                        }

                    )

                except Exception as e:
                    self.stdout.write(
                        f"Failed {mal_id}: {e}"
                    )
                    continue
                total_saved += 1


                # protect Jikan

                time.sleep(
                    1
                )



        self.stdout.write(

            self.style.SUCCESS(

                f"SYNC COMPLETE. Saved {total_saved}"

            )

        )