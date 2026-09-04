import { useQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";


export function useAnimeExternalLinks(id) {
    return useQuery({
        queryKey: ["anime", "external-links", id],
        queryFn: () => AnimeAPI.externalLinks(id),
        enabled: Boolean(id),
        staleTime: 30 * 60 * 1000,
    });
}
