import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api/client";

export function useAnimeSearch(query, filters = {}) {

    return useInfiniteQuery({

        queryKey: [
            "anime-search",
            query,
            filters
        ],

        queryFn: async ({ pageParam = 1 }) => {

            const { data } = await api.get(
                "/anime/search/",
                {
                    params: {
                        q: query,
                        page: pageParam,
                        ...filters
                    }
                }
            );

            return data?.data ?? data;
        },


        placeholderData:
            previousData => previousData,


        enabled:
            query.trim().length >= 3 ||
            Object.keys(filters).length > 0,


        getNextPageParam:
            (lastPage) => {

                if(!lastPage?.has_next){
                    return undefined;
                }

                return lastPage.page + 1;
            },


        retry: 2,

    });
}