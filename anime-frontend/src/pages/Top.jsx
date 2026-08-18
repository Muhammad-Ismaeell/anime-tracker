// src/pages/Top.jsx

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";
import AnimeCard from "../components/AnimeCard";
import PageContainer from "../components/ui/PageContainer";
import { useToggleFavorite } from "../hooks/user/useFavorites";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import { useEffect } from "react";
import { useFavorites } from "../hooks/user/useFavorites";

function Top() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteAnime("top");

    const toggleFavorite = useToggleFavorite();
    const { data: favoritesRes } = useFavorites();
    const favoriteIds = new Set(
        (favoritesRes?.results || []).map(f => String(f.anime_id))
    );
    const { statusMap } = useGlobalLibrary();
    if (isLoading) {
        return (
            <PageContainer>
                Loading...
            </PageContainer>
        );
    }

    const animeList =
        data?.pages?.flatMap(
            page => page.items || []
        ) || [];


    return (
        <PageContainer>

            <div className="section-header">
                <h1>⭐ Top Rated Anime</h1>
            </div>

            <div className="grid">

                {animeList.map(item => {

                    const liked = favoriteIds.has(String(item.id));

                    return (
                        <AnimeCard
                            key={item.id}
                            anime={item}
                            statusMap={statusMap}
                            isFavorited={liked}
                            onToggleFavorite={() =>
                                toggleFavorite.mutate({
                                    anime_id: item.id,
                                    title: item.title,
                                    image: item.image,
                                })
                            }
                        />
                    );
                })}

            </div>

            {hasNextPage && (
                <button
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