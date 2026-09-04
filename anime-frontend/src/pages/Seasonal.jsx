import { useEffect, useRef } from "react";

import "../styles/infinite-scroll.css";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";
import {
    useToggleFavorite,
} from "../hooks/user/useFavorites";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";

function Seasonal() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const loadMoreRef = useRef(null);
    const canLoadMoreRef = useRef(true);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isError,
        isFetchingNextPage,
    } = useInfiniteAnime("seasonal");

    const toggleFavorite = useToggleFavorite();
    const { statusMap } = useGlobalLibrary();

    const favoriteIds = useFavoriteIds();

    useEffect(() => {
        const element = loadMoreRef.current;

        if (!element) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) {
                    canLoadMoreRef.current = true;
                    return;
                }

                if (
                    canLoadMoreRef.current &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    canLoadMoreRef.current = false;
                    fetchNextPage();
                }
            },
            { rootMargin: "100px" }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (isLoading) {
        return (
            <PageContainer>
                <div className="section-header">
                    <h1>🌸 Seasonal Anime</h1>
                </div>

                <div className="grid">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <AnimeCardSkeleton key={index} />
                    ))}
                </div>
            </PageContainer>
        );
    }

    if (isError) {
        return (
            <PageContainer>
                <EmptyState text="Failed to load seasonal anime." />
            </PageContainer>
        );
    }

    const anime = data?.anime ?? [];

    return (
        <PageContainer>
            <div className="section-header">
                <h1>🌸 Seasonal Anime</h1>
            </div>

            {anime.length === 0 ? (
                <EmptyState text="No seasonal anime found." />
            ) : (
                <div className="grid">
                    {anime.map((item) => {
                        const animeId = String(item.id);

                        return (
                            <AnimeCard
                                key={animeId}
                                anime={item}
                                statusMap={statusMap}
                                isFavorited={favoriteIds.has(animeId)}
                                isFavoritePending={toggleFavorite.isPending}
                                onToggleFavorite={() =>
                                    toggleFavorite.mutate({
                                        anime_id: item.id,
                                        title: item.title,
                                        image: item.image || "",
                                    })
                                }
                            />
                        );
                    })}
                </div>
            )}

            {hasNextPage && (
                <div ref={loadMoreRef} className="infinite-scroll-sentinel" aria-hidden="true">
                    {isFetchingNextPage && (
                        <div className="grid infinite-scroll-skeleton-grid">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <AnimeCardSkeleton key={index} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </PageContainer>
    );
}

export default Seasonal;
