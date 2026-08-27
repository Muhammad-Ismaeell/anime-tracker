import { useMemo } from "react";
import { useFavorites } from "./useFavorites";

export function useFavoriteIds() {
    const { data } = useFavorites();

    return useMemo(() => {
        const favorites = data?.results ?? [];

        return new Set(
            favorites
                .map((favorite) => {
                    const id =
                        favorite?.anime?.mal_id ??
                        favorite?.anime?.id ??
                        favorite?.anime_id ??
                        favorite?.mal_id;

                    return id != null ? String(id) : null;
                })
                .filter(Boolean)
        );
    }, [data]);
}