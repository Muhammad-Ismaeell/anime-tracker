import { useQuery } from "@tanstack/react-query";
import { AnimeAPI } from "../api/anime.api";

export function useAnimeDetail(id) {
    return useQuery({
        queryKey: ["anime-detail", id],
        queryFn: async () => {
            const data = await AnimeAPI.detail(id);
            return data.item;   // 👈 unwrap here
        },
        enabled: !!id,
    });
}