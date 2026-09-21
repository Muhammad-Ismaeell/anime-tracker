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

    const normalImage =
        anime.images?.webp?.image_url ??
        anime.images?.jpg?.image_url ??
        anime.image ??
        "";

    const largeImage =
        anime.images?.webp?.large_image_url ??
        anime.images?.jpg?.large_image_url ??
        anime.image_large ??
        normalImage;

    return {
        id: animeId,
        mal_id: animeId,
        title:
            anime.title ??
            anime.title_english ??
            "Unknown Anime",
        image: normalImage,
        largeImage,
        score: anime.score ?? 0,
        type: anime.type ?? "",
        episodes: anime.episodes ?? null,
        year: anime.year ?? anime.aired?.prop?.from?.year ?? null,
        synopsis: anime.synopsis ?? "",
        trailer: anime.trailer ?? null,
    };
};
