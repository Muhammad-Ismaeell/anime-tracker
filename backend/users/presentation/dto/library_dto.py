from .base import BaseDTO


class LibraryItemDTO(BaseDTO):

    def __init__(self, status_obj):

        anime = status_obj.anime

        self.anime_id = anime.mal_id
        self.title = anime.title
        self.image = anime.image

        self.status = status_obj.status
        self.progress = status_obj.progress
        self.episodes = anime.episodes