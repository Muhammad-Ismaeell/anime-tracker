import { useQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";


export function useAnimeStatistics(animeId) {
    return useQuery({
        queryKey: ["anime-statistics", animeId],
        queryFn: () => AnimeAPI.statistics(animeId),
        enabled: Boolean(animeId),
    });
}
