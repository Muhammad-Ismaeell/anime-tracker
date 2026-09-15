export function extractAnimePages(data) {
    if (!data) {
        return [];
    }

    if (data.anime) {
        return data.anime;
    }

    const pages = data.pages ?? [];
    const map = new Map();

    pages.forEach((page) => {
        (page?.items ?? []).forEach((anime) => {
            if (!anime?.id) {
                return;
            }

            map.set(String(anime.id), anime);
        });
    });

    return Array.from(map.values());
}
