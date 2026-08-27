import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api/client";

export function useAnimeSearch(query = "", filters = {}) {

    const normalizedQuery =
        query.trim();

    return useInfiniteQuery({

        queryKey: [
            "anime-search",
            normalizedQuery,
            filters,
        ],

        queryFn: async ({
            pageParam = 1,
        }) => {

            const { data } =
                await api.get(
                    "/anime/search/",
                    {
                        params: {
                            q: normalizedQuery,
                            page: pageParam,
                            ...filters,
                        },
                    }
                );

            return data?.data ?? data;
        },

        initialPageParam: 1,

        placeholderData:
            (previousData) =>
                previousData,

        enabled:
            normalizedQuery.length >= 3 ||
            Object.keys(filters).length > 0,

        getNextPageParam:
            (lastPage) => {

                if (
                    !lastPage?.has_next
                ) {
                    return undefined;
                }

                return (
                    lastPage.page + 1
                );
            },

        retry: 2,
    });
}