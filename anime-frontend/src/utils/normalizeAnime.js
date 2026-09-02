
export const getAnimeId = (anime) => {
    if (!anime) {
        return null;
    }

    return (
        anime.mal_id ??
        anime.id ??
        anime.anime_id ??
        null
    );
};


export const normalizeAnime = (anime) => {
    if (!anime) {
        return null;
    }

    const animeId = getAnimeId(anime);

    if (animeId == null) {
        return null;
    }

    return {
        // MAL ID is the canonical anime ID everywhere
        id: animeId,

        // Keep mal_id available for compatibility
        mal_id: animeId,

        title:
            anime.title ??
            anime.title_english ??
            "Unknown Anime",

        image:
            anime.images?.webp?.image_url ??
            anime.images?.jpg?.image_url ??
            anime.image ??
            "",

        largeImage:
            anime.images?.webp?.large_image_url ??
            anime.images?.jpg?.large_image_url ??
            anime.image_large ??
            anime.images?.webp?.image_url ??
            anime.images?.jpg?.image_url ??
            anime.image ??
            "",

        score:
            anime.score ??
            0,

        type:
            anime.type ??
            "",

        year:
            anime.year ??
            anime.aired?.prop?.from?.year ??
            null,

        synopsis:
            anime.synopsis ??
            "",
    };
};
