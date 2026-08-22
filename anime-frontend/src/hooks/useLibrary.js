import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import { LibraryAPI } from "../api/library";
import { queryKeys } from "../lib/querykeys";
import toast from "react-hot-toast";


// --------------------
// LIBRARY LIST
// --------------------
export function useLibrary() {
    const {
        user,
        isAuthenticated,
        loading,
    } = useContext(AuthContext);

    const userId = user?.id ?? null;

    return useInfiniteQuery({
        queryKey: [
            ...queryKeys.users.library,
            userId,
        ],

        queryFn: ({ pageParam = 1 }) =>
            LibraryAPI.list(pageParam),

        enabled:
            !loading &&
            isAuthenticated &&
            userId !== null,

        initialPageParam: 1,

        placeholderData:
            (previousData) => previousData,

        getNextPageParam: (lastPage) => {
            if (!lastPage?.next) {
                return undefined;
            }

            const url = new URL(
                lastPage.next
            );

            return Number(
                url.searchParams.get("page")
            );
        },
    });
}


// --------------------
// UPDATE LIBRARY (OPTIMISTIC)
// --------------------
export function useUpdateLibrary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: LibraryAPI.update,

        onMutate: async (payload) => {
            await queryClient.cancelQueries({
                queryKey:
                    queryKeys.users.library,
            });

            const previous =
                queryClient.getQueryData(
                    queryKeys.users.library
                );

            queryClient.setQueryData(
                queryKeys.users.library,
                (old) => {
                    if (!old?.pages) {
                        return old;
                    }

                    return {
                        ...old,
                        pages: old.pages.map(
                            (page) => ({
                                ...page,
                                results:
                                    page.results
                                        .map((item) => {
                                            const match =
                                                String(
                                                    item.anime_id
                                                ) ===
                                                String(
                                                    payload.anime_id
                                                );

                                            if (!match) {
                                                return item;
                                            }

                                            if (
                                                payload.remove
                                            ) {
                                                return null;
                                            }

                                            return {
                                                ...item,
                                                status:
                                                    payload.status,
                                            };
                                        })
                                        .filter(Boolean),
                            })
                        ),
                    };
                }
            );

            return { previous };
        },

        onError: (_, __, context) => {
            if (context?.previous) {
                queryClient.setQueryData(
                    queryKeys.users.library,
                    context.previous
                );
            }

            toast.error(
                "Failed to update library"
            );
        },

        onSuccess: () => {
            toast.success(
                "Library updated!"
            );
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey:
                    queryKeys.users.library,
            });

            queryClient.invalidateQueries({
                queryKey:
                    queryKeys.users.dashboard,
            });
        },
    });
}