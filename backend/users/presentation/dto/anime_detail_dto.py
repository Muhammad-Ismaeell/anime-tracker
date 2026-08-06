class AnimeDetailDTO:


    def __init__(
        self,
        anime,
        embed_url=None
    ):

        self.id = anime.mal_id
        self.title = anime.title

        self.image = (
            anime.image_large
            or anime.image
        )

        self.score = anime.score
        self.episodes = anime.episodes
        self.status = anime.status
        self.type = anime.type
        self.year = anime.year
        self.season = anime.season

        self.synopsis = anime.synopsis

        self.trailer = {
            "embed_url": embed_url
        }


    def to_dict(self):

        return self.__dict__