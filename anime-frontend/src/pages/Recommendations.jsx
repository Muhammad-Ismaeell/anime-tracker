import { useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";
import { AnimeAPI } from "../api/anime.api";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";
import { useToggleFavorite } from "../hooks/user/useFavorites";
import { normalizeAnime } from "../utils/normalizeAnime";

import "../styles/recommendations.css";

function Recommendations() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { library } = useGlobalLibrary();
    const favoriteIds = useFavoriteIds();
    const toggleFavorite = useToggleFavorite();

    const sourceAnime = useMemo(() => {
        const preferred = ["watching", "plan_to_watch", "completed"];

        return preferred
            .flatMap((status) =>
                library.filter((item) => item.status === status)
            )
            .map((item) => item.anime)
            .filter((anime) => anime?.id || anime?.mal_id)
            .slice(0, 4);
    }, [library]);

    const recommendationQueries = useQueries({
        queries: sourceAnime.map((anime) => {
            const id = anime.id ?? anime.mal_id;

            return {
                queryKey: ["anime-recommendations", id],
                queryFn: async () => {
                    const data = await AnimeAPI.recommendations(id);

                    return (data?.items ?? [])
                        .map(normalizeAnime)
                        .filter(Boolean);
                },
                staleTime: 1000 * 60 * 30,
            };
        }),
    });

    const recommendations = useMemo(() => {
        const sourceIds = new Set(
            sourceAnime.map((anime) => String(anime.id ?? anime.mal_id))
        );
        const seen = new Set();
        const items = [];

        recommendationQueries.forEach((query) => {
            (query.data ?? []).forEach((anime) => {
                const id = String(anime.id);

                if (!sourceIds.has(id) && !seen.has(id)) {
                    seen.add(id);
                    items.push(anime);
                }
            });
        });

        return items.slice(0, 20);
    }, [recommendationQueries, sourceAnime]);

    const isLoading =
        sourceAnime.length > 0 &&
        recommendationQueries.some((query) => query.isLoading);

    const isError =
        sourceAnime.length > 0 &&
        recommendationQueries.every((query) => query.isError);

    return (
        <PageContainer>
            <Helmet>
                <title>Recommendations | Anime Tracker</title>
                <meta
                    name="description"
                    content="Discover anime recommendations based on your library."
                />
            </Helmet>

            <div className="recommendations-header">
                <span className="recommendations-eyebrow">DISCOVER</span>
                <h1>Recommendations</h1>
                <p>Anime picks based on what you have in your library.</p>
            </div>

            {sourceAnime.length === 0 ? (
                <EmptyState
                    text="Add some anime to your library to get personalized recommendations."
                    icon="✨"
                />
            ) : isLoading ? (
                <div className="grid">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <AnimeCardSkeleton key={index} />
                    ))}
                </div>
            ) : isError || recommendations.length === 0 ? (
                <EmptyState text="No recommendations found right now." icon="✨" />
            ) : (
                <div className="grid">
                    {recommendations.map((anime) => {
                        const id = String(anime.id);

                        return (
                            <AnimeCard
                                key={id}
                                anime={anime}
                                isFavorited={favoriteIds.has(id)}
                                isFavoritePending={toggleFavorite.isPending}
                                onToggleFavorite={() =>
                                    toggleFavorite.mutate({
                                        anime_id: anime.id,
                                        title: anime.title,
                                        image: anime.image || "",
                                    })
                                }
                            />
                        );
                    })}
                </div>
            )}
        </PageContainer>
    );
}

export default Recommendations;
