import { useQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";
import { normalizeAnime } from "../utils/normalizeAnime";

export function useAnimeDetail(id) {

    return useQuery({

        queryKey: [
            "anime-detail",
            id
        ],

        queryFn: async () => {

            const data = await AnimeAPI.detail(id);

            return normalizeAnime(
                data.item
            );
        },

        enabled: !!id,

        // Do not show the previous anime while navigating
        // from one detail page to another.
        placeholderData: undefined,

    });
}