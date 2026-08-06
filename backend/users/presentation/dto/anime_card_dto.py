class AnimeCardDTO:

    def __init__(self, anime):

        self.id = anime.mal_id
        self.title = anime.title

        self.image = (
            anime.image_large
            or anime.image
        )

        self.score = anime.score
        self.episodes = anime.episodes
        self.type = anime.type
        self.year = anime.year
        self.season = anime.season


    def to_dict(self):

        return self.__dict__