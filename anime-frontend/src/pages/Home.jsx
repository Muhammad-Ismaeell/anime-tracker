import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";
import {
    useEffect,
    useMemo,
    useState,
} from "react";import PageContainer from "../components/ui/PageContainer";
import AnimeSection from "../components/ui/AnimeSection";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";

import {
    useToggleFavorite,
    useFavorites,
} from "../hooks/user/useFavorites";

import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import { normalizeAnime } from "../utils/normalizeAnime";


function Home() {
    const trendingQuery = useInfiniteAnime("trending");
    const seasonalQuery = useInfiniteAnime("seasonal");
    const topQuery = useInfiniteAnime("top");

    const toggleFavorite = useToggleFavorite();

    const { statusMap } = useGlobalLibrary();

    const { data: favoritesRes } = useFavorites();

    const favoriteIds = new Set(
        (favoritesRes?.results ?? [])
            .map((favorite) => {
                const id =
                    favorite.anime?.mal_id ??
                    favorite.anime?.id ??
                    favorite.anime_id ??
                    favorite.mal_id;

                return id != null
                    ? String(id)
                    : null;
            })
            .filter(Boolean)
    );


    const extractAnime = (query) => {
        const pages = query.data?.pages ?? [];
        const map = new Map();

        pages.forEach((page) => {
            const items =
                page.items ??
                page.data ??
                [];

            items.forEach((item) => {
                const anime = normalizeAnime(item);

                if (anime?.id) {
                    map.set(
                        String(anime.id),
                        anime
                    );
                }
            });
        });

        return Array.from(map.values());
    };


    const trendingAnime = useMemo(
        () => extractAnime(trendingQuery),
        [trendingQuery.data]
    );

    const seasonalAnime = useMemo(
        () => extractAnime(seasonalQuery),
        [seasonalQuery.data]
    );

    const topAnime = useMemo(
        () => extractAnime(topQuery),
        [topQuery.data]
    );
    const featuredAnime = trendingAnime.slice(0, 5);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    useEffect(() => {
        if (featuredAnime.length <= 1) {
            return;
        }

        const interval = setInterval(() => {
            setFeaturedIndex((current) =>
                (current + 1) % featuredAnime.length
            );
        }, 7000);

        return () => clearInterval(interval);
    }, [featuredAnime.length]);

    const currentFeatured =
        featuredAnime[featuredIndex];
    


    const loading =
        trendingQuery.isLoading ||
        seasonalQuery.isLoading ||
        topQuery.isLoading;


    const error =
        trendingQuery.error ||
        seasonalQuery.error ||
        topQuery.error;


    if (error) {
        return (
            <PageContainer>
                <EmptyState
                    text="Failed to load anime."
                />
            </PageContainer>
        );
    }


    return (
        <PageContainer>
            <Helmet>
                <title>
                    Anime Tracker
                </title>

                <meta
                    name="description"
                    content="Discover trending, seasonal, and top-rated anime."
                />
            </Helmet>


            {!loading && currentFeatured && (
                <section
                    className="home-hero"
                    style={{
                        backgroundImage: `
                            linear-gradient(
                                90deg,
                                rgba(10, 10, 18, 0.98) 0%,
                                rgba(10, 10, 18, 0.88) 35%,
                                rgba(10, 10, 18, 0.35) 70%,
                                rgba(10, 10, 18, 0.15) 100%
                            ),
                            url(${currentFeatured.image})
                        `,
                    }}
                >
                    <div className="home-hero-content">
                        <span className="home-hero-eyebrow">
                            🔥 FEATURED FROM TRENDING
                        </span>

                        <h1 className="home-hero-title">
                            {currentFeatured.title}
                        </h1>

                        <div className="home-hero-meta">
                            {currentFeatured.score > 0 && (
                                <span>
                                    ⭐{" "}
                                    {currentFeatured.score.toFixed(1)}
                                </span>
                            )}

                            {currentFeatured.type && (
                                <span>
                                    {currentFeatured.type}
                                </span>
                            )}

                            {currentFeatured.year && (
                                <span>
                                    {currentFeatured.year}
                                </span>
                            )}
                        </div>

                        <p className="home-hero-description">
                            {currentFeatured.synopsis ||
                                "Discover this anime and add it to your library."}
                        </p>

                        <div className="home-hero-actions">
                            <Link
                                to={`/anime/${currentFeatured.id}`}
                                className="home-hero-primary"
                            >
                                View Details
                            </Link>

                            <Link
                                to="/trending"
                                className="home-hero-secondary"
                            >
                                Explore Trending
                            </Link>
                        </div>
                    </div>

                    {featuredAnime.length > 1 && (
                        <>
                            <button
                                type="button"
                                className="home-hero-nav home-hero-prev"
                                onClick={() =>
                                    setFeaturedIndex(
                                        (current) =>
                                            (current - 1 + featuredAnime.length) %
                                            featuredAnime.length
                                    )
                                }
                                aria-label="Previous featured anime"
                            >
                                ‹
                            </button>

                            <button
                                type="button"
                                className="home-hero-nav home-hero-next"
                                onClick={() =>
                                    setFeaturedIndex(
                                        (current) =>
                                            (current + 1) %
                                            featuredAnime.length
                                    )
                                }
                                aria-label="Next featured anime"
                            >
                                ›
                            </button>

                            <div className="home-hero-dots">
                                {featuredAnime.map((anime, index) => (
                                    <button
                                        key={anime.id}
                                        type="button"
                                        className={
                                            index === featuredIndex
                                                ? "home-hero-dot active"
                                                : "home-hero-dot"
                                        }
                                        onClick={() =>
                                            setFeaturedIndex(index)
                                        }
                                        aria-label={`Show featured anime ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            )}


            {loading ? (
                <div className="grid">
                    {Array.from({
                        length: 12,
                    }).map((_, index) => (
                        <AnimeCardSkeleton
                            key={index}
                        />
                    ))}
                </div>
            ) : (
                <>
                    <AnimeSection
                        title="Trending Anime"
                        emoji="🔥"
                        animeList={trendingAnime}
                        statusMap={statusMap}
                        favoriteIds={favoriteIds}
                        toggleFavorite={toggleFavorite}
                        viewAllPath="/trending"
                    />

                    <AnimeSection
                        title="Current Season"
                        emoji="🌸"
                        animeList={seasonalAnime}
                        statusMap={statusMap}
                        favoriteIds={favoriteIds}
                        toggleFavorite={toggleFavorite}
                        viewAllPath="/seasonal"
                    />

                    <AnimeSection
                        title="Top Rated Anime"
                        emoji="⭐"
                        animeList={topAnime}
                        statusMap={statusMap}
                        favoriteIds={favoriteIds}
                        toggleFavorite={toggleFavorite}
                        viewAllPath="/top"
                    />
                </>
            )}
        </PageContainer>
    );
}


export default Home;