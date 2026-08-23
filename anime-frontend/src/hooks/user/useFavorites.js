import { useContext } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { AuthContext } from "../../context/AuthContext";
import { FavoriteAPI } from "../../api/favorites";
import { queryKeys } from "../../lib/querykeys";
import toast from "react-hot-toast";


// ============================
// GET FAVORITES
// ============================

export function useFavorites(page = 1) {
    const {
        user,
        isAuthenticated,
        loading,
    } = useContext(AuthContext);

    const userId = user?.id ?? null;

    return useQuery({
        queryKey: [
            ...queryKeys.users.favorites,
            userId,
            page,
        ],

        queryFn: () =>
            FavoriteAPI.list(page),

        enabled:
            !loading &&
            isAuthenticated &&
            userId !== null,

        select: (response) => {
            const data =
                response?.data ?? response;

            return {
                results:
                    data?.results ?? [],
                count:
                    data?.count ?? 0,
                next:
                    data?.next ?? null,
                previous:
                    data?.previous ?? null,
            };
        },
    });
}


// ============================
// TOGGLE FAVORITE
// ============================

export function useToggleFavorite() {
    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: FavoriteAPI.toggle,

        onSuccess: async () => {

            toast.success(
                "Favorite updated!"
            );


            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.favorites,
            });


            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.activity,
            });

        },

        onError: () => {
            toast.error(
                "Failed to update favorite"
            );
        },

    });
}