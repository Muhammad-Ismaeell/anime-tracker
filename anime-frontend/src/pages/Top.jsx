import { useEffect } from "react";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";
import { useToggleFavorite, useFavorites } from "../hooks/user/useFavorites";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import { normalizeAnime } from "../utils/normalizeAnime";

import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import PageContainer from "../components/ui/PageContainer";
import EmptyState from "../components/ui/EmptyState";


function Top() {
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
    } = useInfiniteAnime("top");

    const toggleFavorite = useToggleFavorite();
    const { data: favoritesRes } = useFavorites();
    const { statusMap } = useGlobalLibrary();

    const favoriteIds = new Set(
        (favoritesRes?.results ?? [])
            .map((favorite) => {
                const id =
                    favorite.anime?.mal_id ??
                    favorite.anime?.id ??
                    favorite.anime_id ??
                    favorite.mal_id;

                return id != null ? String(id) : null;
            })
            .filter(Boolean)
    );

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
                                isFavoritePending={
                                    toggleFavorite.isPending
                                }
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
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage
                        ? "Loading..."
                        : "Load More"}
                </button>
            )}
        </PageContainer>
    );
}

export default Top;