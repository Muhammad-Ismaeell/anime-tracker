import { useQuery } from "@tanstack/react-query";

import { AnimeAPI } from "../api/anime.api";


export function useAnimeStaff(animeId) {
    return useQuery({
        queryKey: ["anime-staff", animeId],
        queryFn: () => AnimeAPI.staff(animeId),
        enabled: Boolean(animeId),
    });
}
