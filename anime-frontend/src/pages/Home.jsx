import { useEffect, useMemo, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useInfiniteAnime } from "../hooks/useInfintiteAnime";

import PageContainer from "../components/ui/PageContainer";
import AnimeSection from "../components/ui/AnimeSection";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";

import { useToggleFavorite } from "../hooks/user/useFavorites";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";

import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import { extractAnimePages } from "../utils/extractAnimePages";

function Home() {
    // ============================================================
    // DATA
    // ============================================================

    const trendingQuery = useInfiniteAnime("trending");
    const seasonalQuery = useInfiniteAnime("seasonal");
    const topQuery = useInfiniteAnime("top");

    const toggleFavorite = useToggleFavorite();

    const { statusMap } = useGlobalLibrary();
    
    // ============================================================
    // HERO STATE
    // ============================================================

    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState(1);

    const transitionTimeoutRef = useRef(null);


    // ============================================================
    // FAVORITES
    // ============================================================

    const favoriteIds = useFavoriteIds();



    // ============================================================
    // ANIME LISTS
    // ============================================================

    const trendingAnime = useMemo(
        () => extractAnimePages(trendingQuery.data),
        [trendingQuery.data]
    );

    const seasonalAnime = useMemo(
        () => extractAnimePages(seasonalQuery.data),
        [seasonalQuery.data]
    );

    const topAnime = useMemo(
        () => extractAnimePages(topQuery.data),
        [topQuery.data]
    );
    

    // ============================================================
    // FEATURED ANIME
    // ============================================================

    const featuredAnime = useMemo(
        () => trendingAnime.slice(0, 5),
        [trendingAnime]
    );


    /*
     * Do NOT reset featuredIndex inside an effect.
     *
     * If the list changes and the old index is no longer valid,
     * safely use index 0 for rendering.
     */
    const safeFeaturedIndex =
        featuredAnime.length > 0
            ? featuredIndex % featuredAnime.length
            : 0;

    const currentFeatured =
        featuredAnime[safeFeaturedIndex];


    // ============================================================
    // HERO TRANSITION
    // ============================================================

    const changeFeatured = (nextIndex, direction = 1) => {
        if (featuredAnime.length <= 1) {
            return;
        }

        if (transitionTimeoutRef.current) {
            window.clearTimeout(transitionTimeoutRef.current);
        }

        setSlideDirection(direction);
        setFeaturedIndex(nextIndex);
    };

    const handleNext = () => {
        if (featuredAnime.length <= 1) {
            return;
        }

        const nextIndex =
            (safeFeaturedIndex + 1) %
            featuredAnime.length;

        changeFeatured(nextIndex, 1);
    };

    const handlePrevious = () => {
        if (featuredAnime.length <= 1) {
            return;
        }

        const previousIndex =
            (safeFeaturedIndex - 1 + featuredAnime.length) %
            featuredAnime.length;

        changeFeatured(previousIndex, -1);
    };

    useEffect(() => {
        if (featuredAnime.length <= 1) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            setSlideDirection(1);

            setFeaturedIndex((current) => {
                return (current + 1) % featuredAnime.length;
            });
        }, 7000);

        return () => {
            window.clearInterval(interval);
        };
    }, [featuredAnime.length]);




// ============================================================
// LOADING / ERROR
// ============================================================

const loading =
    trendingQuery.isPending ||
    seasonalQuery.isPending ||
    topQuery.isPending;


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


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <PageContainer>

            <Helmet>
                <title>Anime Tracker</title>

                <meta
                    name="description"
                    content="Discover trending, seasonal, and top-rated anime."
                />
            </Helmet>


            {/* ==================================================
                HERO
            ================================================== */}

            {!loading && currentFeatured && (
                <section className="home-hero">
                    <AnimatePresence
                        initial={false}
                        mode="sync"
                        custom={slideDirection}
                    >
                        <motion.div
                            key={currentFeatured.id}
                            className="home-hero-background"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.55, ease: "easeInOut" }}
                            style={{
                                backgroundImage: `
                                    linear-gradient(
                                        90deg,
                                        rgba(10, 10, 18, 0.98) 0%,
                                        rgba(10, 10, 18, 0.88) 35%,
                                        rgba(10, 10, 18, 0.42) 68%,
                                        rgba(10, 10, 18, 0.16) 100%
                                    ),
                                    url(${currentFeatured.largeImage || currentFeatured.image})
                                `,
                            }}
                        />
                    </AnimatePresence>

                    <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
                        <motion.div
                            key={currentFeatured.id}
                            className="home-hero-content"
                            custom={slideDirection}
                            initial={{
                                opacity: 0,
                                x: slideDirection * 24,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            exit={{
                                opacity: 0,
                                x: slideDirection * -24,
                            }}
                            transition={{
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1],
                            }}
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
                                        ⭐ {currentFeatured.score.toFixed(1)}
                                    </span>
                                )}

                                {currentFeatured.type && (
                                    <span>{currentFeatured.type}</span>
                                )}

                                {currentFeatured.year && (
                                    <span>{currentFeatured.year}</span>
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
                        </motion.div>
                    </AnimatePresence>

                    {/* ONE LARGE POSTER */}
                    <div className="home-hero-poster-stage">
                        <AnimatePresence
                            initial={false}
                            mode="wait"
                            custom={slideDirection}
                        >
                            <motion.img
                                key={currentFeatured.id}
                                src={
                                    currentFeatured.largeImage ||
                                    currentFeatured.image
                                }
                                alt={currentFeatured.title}
                                className="home-hero-poster-image"
                                custom={slideDirection}
                                initial={{
                                    opacity: 0,
                                    x: slideDirection * 90,
                                    scale: 0.97,
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    x: slideDirection * -90,
                                    scale: 0.97,
                                }}
                                transition={{
                                    duration: 0.55,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            />
                        </AnimatePresence>
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
                                {featuredAnime.map((anime, index) => (
                                    <button
                                        key={anime.id}
                                        type="button"
                                        className={
                                            index === safeFeaturedIndex
                                                ? "home-hero-dot active"
                                                : "home-hero-dot"
                                        }
                                        onClick={() =>
                                            changeFeatured(
                                                index,
                                                index > safeFeaturedIndex ? 1 : -1
                                            )
                                        }
                                        aria-label={`Show featured anime ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            )}


            {/* ==================================================
                    CONTENT
                ================================================== */}

                {loading ? (
                    <>
                        <div className="home-hero-skeleton">
                            <div className="home-hero-skeleton-content">
                                <div className="home-hero-skeleton-eyebrow shimmer" />

                                <div className="home-hero-skeleton-title shimmer" />

                                <div className="home-hero-skeleton-meta shimmer" />

                                <div className="home-hero-skeleton-description shimmer" />

                                <div className="home-hero-skeleton-button shimmer" />
                            </div>
                        </div>

                        <div className="grid">
                            {Array.from({ length: 12 }).map((_, index) => (
                                <AnimeCardSkeleton key={index} />
                            ))}
                        </div>
                    </>
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