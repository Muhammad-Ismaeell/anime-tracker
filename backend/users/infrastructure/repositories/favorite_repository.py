from users.infrastructure.models import FavoriteAnime


class FavoriteRepository:

    @staticmethod
    def get_or_create(user, anime):
        return FavoriteAnime.objects.get_or_create(
            user=user,
            anime=anime,
        )

    @staticmethod
    def delete(favorite):
        favorite.delete()

    @staticmethod
    def exists(user, anime):
        return FavoriteAnime.objects.filter(
            user=user,
            anime=anime,
        ).exists()