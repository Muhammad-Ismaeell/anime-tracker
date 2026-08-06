import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { normalizeAnime } from "../utils/normalizeAnime";

export function useNavbarSearch(query) {

    return useQuery({

        queryKey: ["navbar-search", query],

        queryFn: async () => {
            const res = await api.get("/anime/search/", {
                params: { q: query }
            });

            const data = res.data?.data ?? res.data;

            const items =
                data?.items ||
                data?.results ||
                [];

            return items
                .map(normalizeAnime)
                .filter(Boolean);
        },

        enabled: query.trim().length >= 3,
        staleTime: 1000 * 60 * 5,
    });
}