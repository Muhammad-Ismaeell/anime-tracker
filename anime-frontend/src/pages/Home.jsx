import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
    AnimatePresence,
    motion,
} from "framer-motion";

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

    const favoriteIds = useFavoriteIds();


    // ============================================================
    // HERO STATE
    // ============================================================

    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState(1);

    const touchStartX = useRef(null);
    const touchStartY = useRef(null);


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

    const safeFeaturedIndex =
        featuredAnime.length > 0
            ? featuredIndex % featuredAnime.length
            : 0;

    const currentFeatured =
        featuredAnime[safeFeaturedIndex];


    // ============================================================
    // HERO NAVIGATION
    // ============================================================

    const handleNext = () => {

        if (featuredAnime.length <= 1) {
            return;
        }

        setSlideDirection(1);

        setFeaturedIndex(
            (current) =>
                (current + 1) % featuredAnime.length
        );
    };


    const handlePrevious = () => {

        if (featuredAnime.length <= 1) {
            return;
        }

        setSlideDirection(-1);

        setFeaturedIndex(
            (current) =>
                (current - 1 + featuredAnime.length) %
                featuredAnime.length
        );
    };


    const handleDotClick = (index) => {

        if (index === safeFeaturedIndex) {
            return;
        }

        setSlideDirection(
            index > safeFeaturedIndex ? 1 : -1
        );

        setFeaturedIndex(index);
    };


    // ============================================================
    // MOBILE SWIPE
    // ============================================================

    const handleTouchStart = (event) => {

        const touch = event.touches[0];

        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
    };


    const handleTouchEnd = (event) => {

        if (touchStartX.current === null) {
            return;
        }

        const touch = event.changedTouches[0];

        const deltaX =
            touch.clientX - touchStartX.current;

        const deltaY =
            touch.clientY - touchStartY.current;

        touchStartX.current = null;
        touchStartY.current = null;


        // Let normal vertical scrolling happen.
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            return;
        }


        // Ignore tiny movements.
        if (Math.abs(deltaX) < 45) {
            return;
        }


        if (deltaX < 0) {
            handleNext();
        } else {
            handlePrevious();
        }
    };


    // ============================================================
    // AUTO ROTATION
    // ============================================================

    useEffect(() => {

        if (featuredAnime.length <= 1) {
            return undefined;
        }

        const interval = window.setInterval(() => {

            setSlideDirection(1);

            setFeaturedIndex(
                (current) =>
                    (current + 1) % featuredAnime.length
            );

        }, 6500);


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

                <section
                    className="home-hero"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >

                    {/* ==================================================
                        BLURRED BACKGROUND
                    ================================================== */}

                    <AnimatePresence
                        initial={false}
                        mode="sync"
                    >

                        <motion.div
                            key={`background-${currentFeatured.id}`}
                            className="home-hero-background"
                            initial={{
                                opacity: 0,
                                scale: 1.04,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 1.02,
                            }}
                            transition={{
                                duration: 0.32,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            style={{
                                backgroundImage: `
                                    linear-gradient(
                                        90deg,
                                        rgba(10,10,18,0.95),
                                        rgba(10,10,18,0.55)
                                    ),
                                    url(${currentFeatured.background || currentFeatured.largeImage || currentFeatured.image})
                                `,
                            }}
                        />

                    </AnimatePresence>


                    {/* ==================================================
                        DARK OVERLAY
                    ================================================== */}

                    <div className="home-hero-overlay" />

                    {/* ==================================================
                        CONTENT
                    ================================================== */}

                    <AnimatePresence
                        mode="sync"
                        initial={false}
                        custom={slideDirection}
                    >
                        <motion.div
                            key={currentFeatured.id}
                            className="home-hero-content"
                            custom={slideDirection}
                            initial={{
                                opacity: 0,
                                x: slideDirection * 25,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            exit={{
                                opacity: 0,
                                x: slideDirection * -25,
                            }}
                            transition={{
                                duration: 0.25,
                                ease: [0.22,1,0.36,1],
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

                            <div className="home-hero-genres">

                                {currentFeatured.genres?.slice(0,3).map(
                                    (genre)=>(
                                        <span key={genre}>
                                            {genre}
                                        </span>
                                    )
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


                                <button
                                    className="home-hero-secondary"
                                    type="button"
                                >
                                    + Add to Library
                                </button>

                            </div>

                        </motion.div>

                    </AnimatePresence>


                    {/* ==================================================
                        DESKTOP NAVIGATION
                    ================================================== */}

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
                                                index === safeFeaturedIndex
                                                    ? "home-hero-dot active"
                                                    : "home-hero-dot"
                                            }

                                            onClick={() =>
                                                handleDotClick(index)
                                            }

                                            aria-label={
                                                `Show featured anime ${index + 1}`
                                            }
                                        />

                                    )
                                )}

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

                        {Array.from({
                            length: 12,
                        }).map((_, index) => (

                            <AnimeCardSkeleton
                                key={index}
                            />

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