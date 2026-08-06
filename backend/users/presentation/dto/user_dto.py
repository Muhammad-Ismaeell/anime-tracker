from .base import BaseDTO


class UserDTO(BaseDTO):

    def __init__(self, user, profile, stats):

        self.username = user.username
        self.avatar = (
            profile.avatar.url
            if profile.avatar else None
        )

        self.bio = profile.bio
        self.favorite_genre = profile.favorite_genre
        self.stats = stats