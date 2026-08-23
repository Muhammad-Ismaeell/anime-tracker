export const normalizeAnime = (anime) => {
    if (!anime) {
        return null;
    }

    return {
        // Database ID
        id:
            anime.id ?? 
            anime.mal_id,

        // MAL ID for detail requests
        mal_id:
            anime.mal_id ??
            anime.id,

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