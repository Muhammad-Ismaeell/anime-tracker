import { useInfiniteQuery } from "@tanstack/react-query";
import { UserAPI } from "../../api/user.api";

export function useActivity() {
    return useInfiniteQuery({
        queryKey: ["user", "activity"],

        queryFn: async ({ pageParam = 1 }) => {
            const res = await UserAPI.activity(pageParam);
            return res.data; // THIS is correct (paginated object)
        },

        initialPageParam: 1,

        getNextPageParam: (lastPage) => {
            if (!lastPage?.next) return undefined;

            const url = new URL(lastPage.next);
            return Number(url.searchParams.get("page"));
        }
    });
}