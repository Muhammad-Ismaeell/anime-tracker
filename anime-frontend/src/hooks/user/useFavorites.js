import { useContext } from "react";

import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import { FavoriteAPI } from "../../api/favorites";
import { AuthContext } from "../../context/AuthContext";
import { queryKeys } from "../../lib/querykeys";

export function useFavorites() {
    const { user, isAuthenticated, loading } = useContext(AuthContext);
    const userId = user?.id ?? null;

    return useInfiniteQuery({
        queryKey: [...queryKeys.users.favorites, userId],
        queryFn: ({ pageParam = 1 }) => FavoriteAPI.list(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage?.next) {
                return undefined;
            }

            return allPages.length + 1;
        },
        enabled: !loading && isAuthenticated && userId !== null,
        placeholderData: (previousData) => previousData,
        select: (data) => ({
            ...data,
            pages: data.pages.map((page) => ({
                results: page?.results ?? [],
                count: page?.count ?? 0,
                next: page?.next ?? null,
                previous: page?.previous ?? null,
            })),
        }),
    });
}

export function useToggleFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: FavoriteAPI.toggle,
        onSuccess: async () => {
            toast.success("Favorite updated!");

            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.favorites,
                exact: false,
            });

            await queryClient.invalidateQueries({
                queryKey: ["favoriteIds"],
                exact: false,
            });

            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.activity,
                exact: false,
            });

            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.dashboard,
                exact: false,
            });
        },
        onError: () => {
            toast.error("Failed to update favorite");
        },
    });
}
