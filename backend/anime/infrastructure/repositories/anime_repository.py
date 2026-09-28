from anime.infrastructure.models import Anime


class AnimeRepository:

    @staticmethod
    def get_by_mal_id(mal_id):
        """Return an anime by MAL ID or None if it does not exist."""
        return Anime.objects.filter(mal_id=mal_id).first()

    @staticmethod
    def get_or_raise(mal_id):
        """Return an anime by MAL ID or raise Anime.DoesNotExist."""
        return Anime.objects.get(mal_id=mal_id)

    @staticmethod
    def exists(mal_id):
        """Return whether an anime with the given MAL ID exists."""
        return Anime.objects.filter(mal_id=mal_id).exists()

    @staticmethod
    def create_placeholder(
        mal_id,
        title="Unknown",
        image=None
    ):
        """Create a minimal anime record for later enrichment."""
        return Anime.objects.create(
            mal_id=mal_id,
            title=title,
            image=image,
        )