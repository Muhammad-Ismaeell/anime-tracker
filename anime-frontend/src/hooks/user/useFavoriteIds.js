import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import { FavoriteAPI } from "../../api/favorites";
import { AuthContext } from "../../context/AuthContext";

export function useFavoriteIds() {
    const { user, isAuthenticated, loading } = useContext(AuthContext);
    const userId = user?.id ?? null;

    const query = useQuery({
        queryKey: ["favoriteIds", userId],
        queryFn: async () => {
            const ids = await FavoriteAPI.listIds();
            return new Set(
                ids.filter((id) => id != null).map(String)
            );
        },
        enabled: !loading && isAuthenticated && userId !== null,
        staleTime: 1000 * 60 * 5,
        placeholderData: (previousData) => previousData,
    });

    return query.data ?? new Set();
}
