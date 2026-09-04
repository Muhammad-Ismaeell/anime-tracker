import { useQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";


export function useAnimeRelations(animeId) {
    return useQuery({
        queryKey: ["anime-relations", animeId],
        queryFn: () => AnimeAPI.relations(animeId),
        enabled: Boolean(animeId),
    });
}
