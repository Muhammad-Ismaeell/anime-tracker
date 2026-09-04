import { useInfiniteQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";

export function useAnimeEpisodes(id) {
    return useInfiniteQuery({
        queryKey: ["anime-episodes", id],

        queryFn: ({ pageParam = 1 }) =>
            AnimeAPI.episodes(id, pageParam),

        enabled: !!id,
        initialPageParam: 1,

        getNextPageParam: (lastPage) => {
            if (!lastPage?.has_next) {
                return undefined;
            }

            return (lastPage.page ?? 1) + 1;
        },

        staleTime: 1000 * 60 * 30,
    });
}
