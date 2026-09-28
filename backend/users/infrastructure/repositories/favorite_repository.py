from users.infrastructure.models import FavoriteAnime


class FavoriteRepository:

    @staticmethod
    def get_or_create(user, anime):
        """Return the user's favorite or create it if missing."""

        return FavoriteAnime.objects.get_or_create(
            user=user,
            anime=anime,
        )

    @staticmethod
    def delete(favorite):
        """Delete a favorite record."""

        favorite.delete()

    @staticmethod
    def exists(user, anime):
        """Return whether the user has favorited the anime."""

        return FavoriteAnime.objects.filter(
            user=user,
            anime=anime,
        ).exists()
