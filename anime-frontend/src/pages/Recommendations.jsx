import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";
import { AnimeAPI } from "../api/anime.api";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";
import { useToggleFavorite } from "../hooks/user/useFavorites";
import { normalizeAnime } from "../utils/normalizeAnime";

import "../styles/recommendations.css";

function Recommendations() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const favoriteIds = useFavoriteIds();
    const toggleFavorite = useToggleFavorite();
    const query = useInfiniteQuery({
        queryKey: ["general-recommendations"],
        queryFn: ({ pageParam }) => AnimeAPI.generalRecommendations(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.has_next ? lastPage.page + 1 : undefined,
        staleTime: 1000 * 60 * 30,
    });

    const recommendations = (query.data?.pages ?? [])
        .flatMap((page) => page.items ?? [])
        .map(normalizeAnime)
        .filter(Boolean);

    return (
        <PageContainer>
            <Helmet>
                <title>Recommendations | Anime Tracker</title>
                <meta name="description" content="Discover anime recommendations from across the catalogue." />
            </Helmet>

            <div className="recommendations-header">
                <span className="recommendations-eyebrow">DISCOVER</span>
                <h1>Recommendations</h1>
                <p>Discover anime worth adding to your watchlist.</p>
            </div>

            {query.isLoading ? (
                <div className="grid">
                    {Array.from({ length: 12 }).map((_, index) => <AnimeCardSkeleton key={index} />)}
                </div>
            ) : query.isError || recommendations.length === 0 ? (
                <EmptyState text="No recommendations found right now." icon="✨" />
            ) : (
                <>
                    <div className="grid">
                        {recommendations.map((anime) => {
                            const id = String(anime.id);

                            return (
                                <AnimeCard
                                    key={id}
                                    anime={anime}
                                    isFavorited={favoriteIds.has(id)}
                                    isFavoritePending={toggleFavorite.isPending}
                                    onToggleFavorite={() => toggleFavorite.mutate({
                                        anime_id: anime.id,
                                        title: anime.title,
                                        image: anime.image || "",
                                    })}
                                />
                            );
                        })}
                    </div>

                    {query.hasNextPage && (
                        <div className="discovery-load-more">
                            <button
                                type="button"
                                className="discovery-load-more-button"
                                onClick={() => query.fetchNextPage()}
                                disabled={query.isFetchingNextPage}
                            >
                                {query.isFetchingNextPage ? "Loading..." : "Load More"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </PageContainer>
    );
}

export default Recommendations;
