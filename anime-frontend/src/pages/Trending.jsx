import { useInfiniteAnime } from "../hooks/useInfintiteAnime";
import AnimeCard from "../components/AnimeCard";
import PageContainer from "../components/ui/PageContainer";
import { normalizeAnime } from "../utils/normalizeAnime";
import { useEffect } from "react";
function Trending() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage
    } = useInfiniteAnime("trending");

    if (isLoading) {
        return <PageContainer>Loading...</PageContainer>;
    }

    const anime = data?.anime || [];

    const normalized = anime.map(normalizeAnime);

    return (
        <PageContainer>

            <div className="section-header">
                <h1>🔥 Trending Anime</h1>
            </div>

            <div className="grid">

                {anime.map(item => (
                    <AnimeCard
                        key={item.id}
                        anime={item}
                    />
                ))}

            </div>

            {hasNextPage && (

                <button
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

export default Trending;