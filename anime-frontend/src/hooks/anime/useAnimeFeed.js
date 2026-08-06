import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimeAPI } from "../../api/anime.api";
import { queryKeys } from "../../queries/keys";

const endpoints = {

    trending: "/anime/trending/",
    seasonal: "/anime/seasonal/",
    top: "/anime/top/",
};

export function useAnimeFeed(type) {

    return useInfiniteQuery({

        queryKey: ["anime-feed", type],

        queryFn: ({ pageParam = 1 }) =>
            AnimeAPI[type](pageParam),

        initialPageParam: 1,

        getNextPageParam: (lastPage) =>
            lastPage.has_next
                ? lastPage.page + 1
                : undefined
    });
}