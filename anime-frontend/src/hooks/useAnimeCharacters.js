import { useQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";


export function useAnimeCharacters(id) {
    return useQuery({
        queryKey: ["anime-characters", id],
        queryFn: async () => {
            const data = await AnimeAPI.characters(id);
            return data?.items ?? [];
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 60,
    });
}
