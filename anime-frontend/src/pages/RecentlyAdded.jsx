import { useEffect } from "react";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";
import { useToggleFavorite } from "../hooks/user/useFavorites";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";

function RecentlyAdded() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteAnime("recentlyAdded");

    const toggleFavorite = useToggleFavorite();
    const { statusMap } = useGlobalLibrary();
    const favoriteIds = useFavoriteIds();

    if (isLoading) {
        return (
            <PageContainer>
                <div className="section-header">
                    <h1>🆕 Recently Added Anime</h1>
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
                <EmptyState text="Failed to load recently added anime." />
            </PageContainer>
        );
    }

    const animeList = data?.anime ?? [];

    return (
        <PageContainer>
            <div className="section-header">
                <h1>🆕 Recently Added Anime</h1>
            </div>

            {animeList.length === 0 ? (
                <EmptyState text="No recently added anime found." />
            ) : (
                <div className="grid">
                    {animeList.map((anime) => {
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
                <button
                    type="button"
                    className="load-more-btn"
                    onClick={fetchNextPage}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage ? "Loading..." : "Load More"}
                </button>
            )}
        </PageContainer>
    );
}

export default RecentlyAdded;
