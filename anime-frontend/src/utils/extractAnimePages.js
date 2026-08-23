export function extractAnimePages(data) {
    const pages = data?.pages ?? [];
    const map = new Map();

    pages.forEach((page) => {
        (page?.items ?? []).forEach((anime) => {
            if (anime?.id == null) {
                return;
            }

            map.set(
                String(anime.id),
                anime
            );
        });
    });

    return Array.from(map.values());
}