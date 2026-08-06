from anime.infrastructure.models import Anime


class AnimeRepository:

    @staticmethod
    def get_by_mal_id(mal_id):
        return Anime.objects.filter(mal_id=mal_id).first()

    @staticmethod
    def get_or_raise(mal_id):
        return Anime.objects.get(mal_id=mal_id)

    @staticmethod
    def exists(mal_id):
        return Anime.objects.filter(mal_id=mal_id).exists()

    @staticmethod
    def create_placeholder(
        mal_id,
        title="Unknown",
        image=None
    ):

        return Anime.objects.create(
            mal_id=mal_id,
            title=title,
            image=image,
        )