
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


// ============================================================
// LIBRARY LIST
// ============================================================

export function useLibrary() {

    const {
        user,
        isAuthenticated,
        loading,
    } = useContext(AuthContext);


    const userId =
        user?.id ?? null;


    const libraryQueryKey = [
        ...queryKeys.users.library,
        userId,
    ];


    return useInfiniteQuery({

        queryKey:
            libraryQueryKey,

        queryFn:
            ({ pageParam = 1 }) =>
                LibraryAPI.list(pageParam),

        enabled:
            !loading &&
            isAuthenticated &&
            userId !== null,

        initialPageParam:
            1,

        placeholderData:
            (previousData) =>
                previousData,

        getNextPageParam:
            (lastPage) => {

                if (!lastPage?.next) {
                    return undefined;
                }

                const url =
                    new URL(lastPage.next);

                const page =
                    url.searchParams.get("page");

                return page
                    ? Number(page)
                    : undefined;
            },
    });
}


// ============================================================
// UPDATE LIBRARY
// OPTIMISTIC UPDATE
// ============================================================

export function useUpdateLibrary() {

    const queryClient =
        useQueryClient();


    const {
        user,
    } = useContext(AuthContext);


    const userId =
        user?.id ?? null;


    const libraryQueryKey = [
        ...queryKeys.users.library,
        userId,
    ];


    return useMutation({

        mutationFn:
            LibraryAPI.update,


        // ----------------------------------------------------
        // OPTIMISTIC UPDATE
        // ----------------------------------------------------

        onMutate: async (payload) => {

            await queryClient.cancelQueries({
                queryKey:
                    libraryQueryKey,
            });


            const previous =
                queryClient.getQueryData(
                    libraryQueryKey
                );


            queryClient.setQueryData(
                libraryQueryKey,
                (old) => {

                    if (!old?.pages) {
                        return old;
                    }


                    return {
                        ...old,

                        pages:
                            old.pages.map(
                                (page) => ({

                                    ...page,

                                    results:
                                        (
                                            page.results ||
                                            []
                                        )
                                            .map(
                                                (item) => {

                                                    const itemAnimeId =
                                                        item.anime_id ??
                                                        item.anime?.mal_id ??
                                                        item.anime?.id;


                                                    const match =
                                                        itemAnimeId != null &&
                                                        String(
                                                            itemAnimeId
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


                                                    const updatedItem = {
                                                        ...item,
                                                    };


                                                    if (
                                                        payload.status !==
                                                        undefined
                                                    ) {
                                                        updatedItem.status =
                                                            payload.status;
                                                    }


                                                    if (
                                                        payload.progress !==
                                                        undefined
                                                    ) {
                                                        updatedItem.progress =
                                                            payload.progress;
                                                    }


                                                    return updatedItem;
                                                }
                                            )
                                            .filter(
                                                Boolean
                                            ),
                                })
                            ),
                    };
                }
            );


            return {
                previous,
            };
        },


        // ----------------------------------------------------
        // ERROR
        // ----------------------------------------------------

        onError: (
            _error,
            _payload,
            context
        ) => {

            if (
                context?.previous
            ) {

                queryClient.setQueryData(
                    libraryQueryKey,
                    context.previous
                );
            }


            toast.error(
                "Failed to update library"
            );
        },


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        onSuccess: () => {

            toast.success(
                "Library updated!"
            );
        },


        // ----------------------------------------------------
        // SETTLED
        // ----------------------------------------------------

        onSettled: () => {

            queryClient.invalidateQueries({
                queryKey:
                    libraryQueryKey,
            });


            queryClient.invalidateQueries({
                queryKey:
                    queryKeys.users.dashboard,
            });
        },
    });
}
