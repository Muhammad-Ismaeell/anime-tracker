import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from anime.application.anime_service import AnimeService
from anime.infrastructure.jikan.jikan_client import is_nsfw
from anime.infrastructure.models import Anime


class Command(BaseCommand):
    help = "Load anime from a Jikan JSON export."

    def add_arguments(self, parser):
        parser.add_argument(
            "file",
            nargs="?",
            default="jikan.json",
        )

    def handle(self, *args, **options):
        file_path = Path(options["file"])

        if not file_path.exists():
            self.stdout.write(
                self.style.ERROR(
                    f"File not found: {file_path}"
                )
            )
            return

        with file_path.open(
            "r",
            encoding="utf-8",
        ) as file:
            payload = json.load(file)

        items = payload.get("data", [])

        if not items:
            self.stdout.write(
                self.style.WARNING(
                    "JSON contains no anime."
                )
            )
            return

        service = AnimeService(client=None)

        created = 0
        updated = 0
        skipped = 0

        for raw in items:

            if is_nsfw(raw):
                skipped += 1
                continue

            mal_id = raw.get("mal_id")

            if not mal_id:
                skipped += 1
                continue

            with transaction.atomic():
                existed = Anime.objects.filter(
                    mal_id=mal_id
                ).exists()

                service.save_anime(raw)

                if existed:
                    updated += 1
                else:
                    created += 1

        self.stdout.write(
            self.style.SUCCESS(
                "\nImport complete\n"
                f"Created: {created}\n"
                f"Updated: {updated}\n"
                f"Skipped: {skipped}\n"
                f"Total anime: {Anime.objects.count()}"
            )
        )