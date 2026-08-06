export function normalizeAnimeFilters(filters = {}) {
    return {
        type: filters.type?.toLowerCase() || undefined,
        season: filters.season?.toLowerCase() || undefined,
        year: filters.year ? Number(filters.year) : undefined
    };
}