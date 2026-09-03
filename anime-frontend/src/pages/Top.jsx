import { useEffect, useRef } from "react";

import "../styles/infinite-scroll.css";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";
import { useToggleFavorite } from "../hooks/user/useFavorites";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import { normalizeAnime } from "../utils/normalizeAnime";

import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import PageContainer from "../components/ui/PageContainer";
import EmptyState from "../components/ui/EmptyState";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";

function Top() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const loadMoreRef = useRef(null);

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteAnime("top");

    const toggleFavorite = useToggleFavorite();
    const { statusMap } = useGlobalLibrary();

    const favoriteIds = useFavoriteIds();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0]?.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            { rootMargin: "500px" }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (isLoading) {
        return (
            <PageContainer>
                <div className="section-header">
                    <h1>⭐ Top Rated Anime</h1>
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
                <EmptyState text="Failed to load top rated anime." />
            </PageContainer>
        );
    }

    const animeList =
        data?.pages?.flatMap(
            (page) => page?.items || []
        ) || [];

    const normalizedAnime = animeList
        .map(normalizeAnime)
        .filter(Boolean);

    return (
        <PageContainer>
            <div className="section-header">
                <h1>⭐ Top Rated Anime</h1>
            </div>

            {normalizedAnime.length === 0 ? (
                <EmptyState text="No top rated anime found." />
            ) : (
                <div className="grid">
                    {normalizedAnime.map((anime) => {
                        const animeId = String(anime.id);

                        return (
                            <AnimeCard
                                key={animeId}
                                anime={anime}
                                statusMap={statusMap}
                                isFavorited={favoriteIds.has(animeId)}
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

export default Top;
