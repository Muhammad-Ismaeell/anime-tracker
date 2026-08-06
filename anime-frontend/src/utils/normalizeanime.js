export const normalizeAnime = (anime) => {
    if (!anime) return null;

    return {
        id: anime.mal_id || anime.id,
        title: anime.title,
        image: anime.images?.jpg?.image_url || anime.image || null,
        score: anime.score ?? 0,
        year: anime.year || anime.aired?.prop?.from?.year,
        synopsis: anime.synopsis || "",
    };
};