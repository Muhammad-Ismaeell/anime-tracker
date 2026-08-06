import { useInfiniteAnime } from "../hooks/useInfintiteAnime";
import AnimeCard from "../components/AnimeCard";
import PageContainer from "../components/ui/PageContainer";
import { useToggleFavorite, useFavorites } from "../hooks/user/useFavorites";
import { normalizeAnime } from "../utils/normalizeAnime";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";
function Home() {

    const trendingQuery = useInfiniteAnime("trending");
    const seasonalQuery = useInfiniteAnime("seasonal");
    const topQuery = useInfiniteAnime("top");
    const toggleFavorite = useToggleFavorite();
    const { statusMap } = useGlobalLibrary();
    const { data: favoritesRes } = useFavorites();

    const favoriteIds = new Set(
        Array.isArray(favoritesRes?.results)
            ? favoritesRes.results.map(f =>
                String(f.anime?.mal_id ?? f.anime_id)
            )
            : []
    );
        
    if (trendingQuery.isLoading || seasonalQuery.isLoading || topQuery.isLoading) {
        return (
            <PageContainer>
                <div className="grid">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <AnimeCardSkeleton key={i} />
                    ))}
                </div>
            </PageContainer>
        );
    }

    if (
        trendingQuery.error ||
        seasonalQuery.error ||
        topQuery.error
    ) {
        return (
            <PageContainer>
                <EmptyState text="Failed to load anime." />
            </PageContainer>
        );
    }
        
    const normalizeList = (list) => {

        const map = new Map();

        list.forEach(item => {

            const anime = normalizeAnime(item);

            const id = anime?.id || anime?.mal_id || anime?.anime_id;
            if (!id) return;

                map.set(String(id), {
                    ...anime,
                    id
                });
        });

        return Array.from(map.values());
    };

    const extractList = (query) => {
        const pages = query?.data?.pages;

        if (!Array.isArray(pages)) return [];

        return pages.flatMap((p) => {
            if (!p) return [];

            if (Array.isArray(p.items)) return p.items;
            if (Array.isArray(p.data)) return p.data;

            return [];
        });
    };

    const trending = extractList(trendingQuery);
    const seasonal = extractList(seasonalQuery);
    const top = extractList(topQuery);

    const trendingAnime = normalizeList(trending);
    const seasonalAnime = normalizeList(seasonal);
    const topAnime = normalizeList(top);
    return (
        <PageContainer>
            
            <Helmet>
                <title>Anime Tracker | Home</title>

                <meta
                    name="description"
                    content="Discover trending, seasonal and top rated anime."
                />
            </Helmet>

            {/* Trending */}
            <section className="home-section">

                <div className="section-header">
                    <h1>🔥 Trending Anime</h1>
                    <Link
                        to="/trending"
                        className="view-all-btn"
                    >
                        View All →
                    </Link>
                </div>

                <div className="grid">

                    {trendingAnime.slice(0, 8).map(anime => {

                        const liked = favoriteIds.has(anime.id)

                        return (
                            <AnimeCard
                                key={anime.id}
                                anime={anime}
                                statusMap={statusMap}
                                isFavorited={liked}
                                onToggleFavorite={() =>
                                    toggleFavorite.mutate({
                                        anime_id: anime.id ?? anime.mal_id,
                                        title: anime.title,
                                        image: anime.image,
                                    })
                                }
                            />
                        );
                    })}

                </div>

            </section>

            {/* Seasonal */}
            <section className="home-section">

                <div className="section-header">
                    <h1>🌸 Current Season</h1>
                    <Link
                        to="/seasonal"
                        className="view-all-btn"
                    >
                        View All →
                    </Link>
                </div>

                <div className="grid">

                    {seasonalAnime.slice(0, 8).map(anime => {

                        const liked = favoriteIds.has(anime.id)

                        return (
                            <AnimeCard
                                key={anime.id}
                                anime={anime}
                                statusMap={statusMap}
                                isFavorited={liked}
                                onToggleFavorite={() =>
                                    toggleFavorite.mutate({
                                        anime_id: anime.id ?? anime.mal_id,
                                        title: anime.title,
                                        image: anime.image,
                                    })
                                }
                            />
                        );
                    })}

                </div>

            </section>

            <section className="home-section">

                <div className="section-header">

                    <h1>⭐ Top Rated Anime</h1>

                    <Link
                        to="/top"
                        className="view-all-btn"
                    >
                        View All →
                    </Link>

                </div>

                <div className="grid">

                    {topAnime.slice(0, 8).map(anime => {

                        const liked = favoriteIds.has(anime.id)

                        return (
                            <AnimeCard
                                key={anime.id}
                                anime={anime}
                                statusMap={statusMap}
                                isFavorited={liked}
                                onToggleFavorite={() =>
                                    toggleFavorite.mutate({
                                        anime_id: anime.id ?? anime.mal_id,
                                        title: anime.title,
                                        image: anime.image,
                                    })
                                }
                            />
                        );
                    })}

                </div>

            </section>

        </PageContainer>
    );
}

export default Home;