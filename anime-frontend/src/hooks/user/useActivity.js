import { useInfiniteQuery } from "@tanstack/react-query";
import { UserAPI } from "../../api/user.api";
import { queryKeys } from "../../lib/querykeys";

export function useActivity() {
    return useInfiniteQuery({

        queryKey: queryKeys.users.activity,

        queryFn: async ({ pageParam = 1 }) => {
            const res = await UserAPI.activity(pageParam);
            return res.data;
        },

        initialPageParam: 1,

        getNextPageParam: (lastPage) => {

            if (!lastPage?.next) {
                return undefined;
            }

            const url = new URL(lastPage.next);

            return Number(
                url.searchParams.get("page")
            );
        },

    });
}