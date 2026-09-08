import { useInfiniteQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";
import { queryKeys } from "../lib/querykeys";
import { normalizeAnime } from "../utils/normalizeAnime";

export function useInfiniteAnime(type) {
    const fetchMap = {
        trending: AnimeAPI.trending,
        seasonal: AnimeAPI.seasonal,
        top: AnimeAPI.top,
        recentlyAdded: AnimeAPI.recentlyAdded,
    };

    const fetcher = fetchMap[type];

    if (!fetcher) {
        throw new Error(`Unknown anime query type: ${type}`);
    }

    return useInfiniteQuery({
        queryKey: queryKeys.anime[type],

        queryFn: ({ pageParam = 1 }) =>
            fetcher(pageParam),

        placeholderData:
            (previousData) => previousData,

        getNextPageParam: (lastPage) =>
            lastPage?.has_next
                ? lastPage.page + 1
                : undefined,

        select: (data) => {
            const map = new Map();

            data.pages.forEach((page) => {
                (page.items || []).forEach((item) => {
                    const anime = normalizeAnime(item);

                    if (!anime?.id) {
                        return;
                    }

                    map.set(String(anime.id), anime);
                });
            });

            return {
                ...data,
                anime: Array.from(map.values()),
            };
        },
    });
}
