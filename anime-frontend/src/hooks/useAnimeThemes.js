import { useQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";


export function useAnimeThemes(animeId) {
    return useQuery({
        queryKey: ["anime-themes", animeId],
        queryFn: () => AnimeAPI.themes(animeId),
        enabled: Boolean(animeId),
        staleTime: 1000 * 60 * 30,
    });
}
