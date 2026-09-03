import { useQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";
import { normalizeAnime } from "../utils/normalizeAnime";

export function useAnimeRecommendations(id) {
    return useQuery({
        queryKey: ["anime-recommendations", id],
        queryFn: async () => {
            const data = await AnimeAPI.recommendations(id);

            return (data?.items ?? [])
                .map(normalizeAnime)
                .filter(Boolean);
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 30,
    });
}
