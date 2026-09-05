import { useQueries } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";

export function useLibraryCharacters(animeIds) {
    return useQueries({
        queries: animeIds.map((id) => ({
            queryKey: ["anime-characters", id],
            queryFn: async () => {
                const data = await AnimeAPI.characters(id);
                return data?.items ?? [];
            },
            staleTime: 1000 * 60 * 60,
        })),
    });
}
