import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";

import PageContainer from "../components/ui/PageContainer";
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

    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [heroVisible, setHeroVisible] = useState(true);


    const favoriteIds = useMemo(() => {
        return new Set(
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
    }, [favoritesRes]);


    const extractAnime = (data) => {
        const pages = data?.pages ?? [];
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
        () => extractAnime(trendingQuery.data),
        [trendingQuery.data]
    );

    const seasonalAnime = useMemo(
        () => extractAnime(seasonalQuery.data),
        [seasonalQuery.data]
    );

    const topAnime = useMemo(
        () => extractAnime(topQuery.data),
        [topQuery.data]
    );


    const featuredAnime = useMemo(
        () => trendingAnime.slice(0, 5),
        [trendingAnime]
    );


    const changeFeatured = (nextIndex) => {
        if (featuredAnime.length <= 1) {
            return;
        }

        setHeroVisible(false);

        window.setTimeout(() => {
            setFeaturedIndex(nextIndex);
            setHeroVisible(true);
        }, 180);
    };


    const handleNext = () => {
        if (featuredAnime.length <= 1) {
            return;
        }

        changeFeatured(
            (featuredIndex + 1) %
                featuredAnime.length
        );
    };


    const handlePrevious = () => {
        if (featuredAnime.length <= 1) {
            return;
        }

        changeFeatured(
            (featuredIndex - 1 + featuredAnime.length) %
                featuredAnime.length
        );
    };


    useEffect(() => {
        if (featuredAnime.length <= 1) {
            return;
        }

        const interval = window.setInterval(() => {
            setHeroVisible(false);

            window.setTimeout(() => {
                setFeaturedIndex((current) =>
                    (current + 1) %
                    featuredAnime.length
                );

                setHeroVisible(true);
            }, 180);
        }, 7000);

        return () => {
            window.clearInterval(interval);
        };
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
                <title>Anime Tracker</title>

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
                            url(${
                                currentFeatured.largeImage ||
                                currentFeatured.image
                            })
                        `,
                    }}
                >
                    <div
                        className={
                            heroVisible
                                ? "home-hero-content hero-visible"
                                : "home-hero-content hero-hidden"
                        }
                    >
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
                                    {currentFeatured.score.toFixed(
                                        1
                                    )}
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
                        </div>
                    </div>


                    {featuredAnime.length > 1 && (
                        <>
                            <button
                                type="button"
                                className="home-hero-nav home-hero-prev"
                                onClick={handlePrevious}
                                aria-label="Previous featured anime"
                            >
                                ←
                            </button>

                            <button
                                type="button"
                                className="home-hero-nav home-hero-next"
                                onClick={handleNext}
                                aria-label="Next featured anime"
                            >
                                →
                            </button>

                            <div className="home-hero-dots">
                                {featuredAnime.map(
                                    (anime, index) => (
                                        <button
                                            key={anime.id}
                                            type="button"
                                            className={
                                                index === featuredIndex
                                                    ? "home-hero-dot active"
                                                    : "home-hero-dot"
                                            }
                                            onClick={() =>
                                                changeFeatured(index)
                                            }
                                            aria-label={`Show featured anime ${
                                                index + 1
                                            }`}
                                            aria-current={
                                                index === featuredIndex
                                                    ? "true"
                                                    : undefined
                                            }
                                        />
                                    )
                                )}
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