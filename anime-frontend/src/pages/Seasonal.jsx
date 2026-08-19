import { useEffect } from "react";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";
import {
    useFavorites,
    useToggleFavorite,
} from "../hooks/user/useFavorites";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";


function Seasonal() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isError,
        isFetchingNextPage,
    } = useInfiniteAnime("seasonal");

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
                                isFavoritePending={
                                    toggleFavorite.isPending
                                }
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
                <button
                    type="button"
                    className="load-more-btn"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage
                        ? "Loading..."
                        : "Load More Anime"}
                </button>
            )}
        </PageContainer>
    );
}

export default Seasonal;