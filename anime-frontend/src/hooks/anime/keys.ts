export const animeKeys = {
    all: ["anime"] as const,
    trending: () => [...animeKeys.all, "trending"] as const,
    seasonal: () => [...animeKeys.all, "seasonal"] as const,
    top: () => [...animeKeys.all, "top"] as const,
    detail: (id: number) => [...animeKeys.all, "detail", id] as const,
};