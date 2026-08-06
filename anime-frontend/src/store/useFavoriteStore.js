import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/querykeys";

export function useFavoritesStore() {

    const queryClient = useQueryClient();

    const favorites =
        queryClient.getQueryData(queryKeys.users.favorites) || [];

    const isFavorite = (animeId) =>
        favorites.some(f =>
            String(f.anime_id) === String(animeId)
        );

    const setFavorites = (newFavorites) => {
        queryClient.setQueryData(
            queryKeys.users.favorites,
            newFavorites
        );
    };

    const toggleLocal = (anime) => {

        const id = anime.anime_id;

        const exists = favorites.some(
            f => String(f.anime_id) === String(id)
        );

        const next = exists
            ? favorites.filter(f => String(f.anime_id) !== String(id))
            : [...favorites, anime];

        setFavorites(next);
    };

    return {
        favorites,
        isFavorite,
        setFavorites,
        toggleLocal
    };
}