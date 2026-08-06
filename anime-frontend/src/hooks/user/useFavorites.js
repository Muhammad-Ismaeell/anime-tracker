import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";

import { FavoriteAPI } from "../../api/favorites";
import { queryKeys } from "../../lib/querykeys";
import toast from "react-hot-toast";

// ============================
// GET FAVORITES
// ============================

export function useFavorites(page = 1) {

    return useQuery({

        queryKey: [
            ...queryKeys.users.favorites,
            page
        ],

        queryFn: () =>
            FavoriteAPI.list(page),

        select: (response) => {

            const data = response?.data ?? response;

            return {
                results: data?.results ?? [],
                count: data?.count ?? 0,
                next: data?.next ?? null,
                previous: data?.previous ?? null,
            };
        }
    });
}



// ============================
// TOGGLE FAVORITE
// ============================

export function useToggleFavorite() {

    const queryClient = useQueryClient();


    return useMutation({

        mutationFn: FavoriteAPI.toggle,


        onSuccess: () => {
            toast.success("Favorite updated!")      
            queryClient.invalidateQueries({
                queryKey: queryKeys.users.favorites,
                exact:false
            });


            queryClient.invalidateQueries({
                queryKey: [
                    "favoriteIds"
                ]
            });
        },
        
        onError: () => {
            toast.error("Failed to update favorite");
        },

    });
}