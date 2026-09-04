import { useQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";


export function useAnimeNews(animeId) {
    return useQuery({
        queryKey: ["anime-news", animeId],
        queryFn: () => AnimeAPI.news(animeId),
        enabled: Boolean(animeId),
        staleTime: 1000 * 60 * 30,
    });
}
