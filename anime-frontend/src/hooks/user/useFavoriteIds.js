import { useMemo } from "react";
import { useFavorites } from "./useFavorites";

export function useFavoriteIds() {
    const { data } = useFavorites();

    return useMemo(() => {
        const favorites = data?.results ?? [];
        return new Set(
            favorites
                .map((favorite) =>
                    String(favorite.anime?.id)
                )
                .filter(Boolean)
        );
    }, [data]);
}