
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
import EmptyState from "../components/ui/EmptyState";

import { useToggleFavorite } from "../hooks/user/useFavorites";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";

import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import { extractAnimePages } from "../utils/extractAnimePages";


function Home() {

    // ============================================================
    // DATA
    // ============================================================

    const trendingQuery =
        useInfiniteAnime("trending");

    const seasonalQuery =
        useInfiniteAnime("seasonal");

    const topQuery =
        useInfiniteAnime("top");


    const toggleFavorite =
        useToggleFavorite();

    const { statusMap } =
        useGlobalLibrary();

    const favoriteIds =
        useFavoriteIds();


    // ============================================================
    // ANIME LISTS
    // ============================================================

    const trendingAnime = useMemo(
        () =>
            extractAnimePages(
                trendingQuery.data
            ),
        [trendingQuery.data]
    );


    const seasonalAnime = useMemo(
        () =>
            extractAnimePages(
                seasonalQuery.data
            ),
        [seasonalQuery.data]
    );


    const topAnime = useMemo(
        () =>
            extractAnimePages(
                topQuery.data
            ),
        [topQuery.data]
    );


    // ============================================================
    // FEATURED HERO
    //
    // The hero intentionally does NOT use trending anime.
    //
    // It combines:
    // - Current seasonal anime
    // - Top rated anime
    //
    // Duplicates are removed.
    // ============================================================

    const featuredAnime = useMemo(() => {

        const combined = [
            ...seasonalAnime,
            ...topAnime,
        ];


        const uniqueAnime =
            Array.from(
                new Map(
                    combined
                        .map((anime) => {

                            const id =
                                anime?.mal_id ??
                                anime?.id;

                            return [
                                id,
                                anime,
                            ];
                        })
                        .filter(
                            ([id]) =>
                                id != null
                        )
                ).values()
            );


        return uniqueAnime
            .filter(
                (anime) =>
                    anime?.image
            )
            .slice(0, 5);

    }, [
        seasonalAnime,
        topAnime,
    ]);


    // ============================================================
    // HERO STATE
    // ============================================================

    const [
        featuredIndex,
        setFeaturedIndex,
    ] = useState(0);


    const [
        slideDirection,
        setSlideDirection,
    ] = useState(1);


    const touchStartX =
        useRef(null);

    const touchStartY =
        useRef(null);


    const safeFeaturedIndex =
        featuredAnime.length > 0
            ? featuredIndex %
              featuredAnime.length
            : 0;


    const currentFeatured =
        featuredAnime[
            safeFeaturedIndex
        ];


    // ============================================================
    // HERO NAVIGATION
    // ============================================================

    const handleNext = () => {

        if (
            featuredAnime.length <= 1
        ) {
            return;
        }


        setSlideDirection(1);


        setFeaturedIndex(
            (current) =>
                (
                    current + 1
                ) %
                featuredAnime.length
        );
    };


    const handlePrevious = () => {

        if (
            featuredAnime.length <= 1
        ) {
            return;
        }


        setSlideDirection(-1);


        setFeaturedIndex(
            (current) =>
                (
                    current - 1 +
                    featuredAnime.length
                ) %
                featuredAnime.length
        );
    };


    const handleDotClick = (
        index
    ) => {

        if (
            index ===
            safeFeaturedIndex
        ) {
            return;
        }


        setSlideDirection(
            index >
            safeFeaturedIndex
                ? 1
                : -1
        );


        setFeaturedIndex(index);
    };


    // ============================================================
    // MOBILE SWIPE
    // ============================================================

    const handleTouchStart = (
        event
    ) => {

        const touch =
            event.touches[0];


        touchStartX.current =
            touch.clientX;


        touchStartY.current =
            touch.clientY;
    };


    const handleTouchEnd = (
        event
    ) => {

        if (
            touchStartX.current ===
            null
        ) {
            return;
        }


        const touch =
            event.changedTouches[0];


        const deltaX =
            touch.clientX -
            touchStartX.current;


        const deltaY =
            touch.clientY -
            touchStartY.current;


        touchStartX.current =
            null;

        touchStartY.current =
            null;


        /*
         * Ignore vertical scrolling.
         */
        if (
            Math.abs(deltaY) >
            Math.abs(deltaX)
        ) {
            return;
        }


        /*
         * Ignore very small swipes.
         */
        if (
            Math.abs(deltaX) < 45
        ) {
            return;
        }


        if (
            deltaX < 0
        ) {
            handleNext();
        } else {
            handlePrevious();
        }
    };


    // ============================================================
    // HERO AUTO ROTATION
    // ============================================================

    useEffect(() => {

        if (
            featuredAnime.length <= 1
        ) {
            return undefined;
        }


        const interval =
            window.setInterval(
                () => {

                    setSlideDirection(1);


                    setFeaturedIndex(
                        (current) =>
                            (
                                current + 1
                            ) %
                            featuredAnime.length
                    );

                },
                6500
            );


        return () => {

            window.clearInterval(
                interval
            );

        };

    }, [
        featuredAnime.length,
    ]);


    // ============================================================
    // FEATURED FAVORITE
    // ============================================================

    const isFeaturedFavorite =
        currentFeatured
            ? favoriteIds instanceof Set &&
              favoriteIds.has(
                  String(
                      currentFeatured.mal_id ??
                      currentFeatured.id
                  )
              )
            : false;


    const handleFeaturedFavorite =
        () => {

            if (
                !currentFeatured
            ) {
                return;
            }


            toggleFavorite.mutate({

                anime_id:
                    currentFeatured.mal_id ??
                    currentFeatured.id,

                title:
                    currentFeatured.title ??
                    "",

                image:
                    currentFeatured.image ??
                    "",

            });

        };


    // ============================================================
    // EXPLORE GENRES
    // ============================================================

    const exploreGenres = [
        "Action",
        "Adventure",
        "Comedy",
        "Drama",
        "Fantasy",
        "Romance",
    ];


    // ============================================================
    // TRENDING SIDEBAR
    // ============================================================

    const trendingSideAnime =
        useMemo(
            () =>
                trendingAnime.slice(
                    0,
                    5
                ),
            [trendingAnime]
        );


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


    // ============================================================
    // ERROR
    // ============================================================

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

                <title>
                    Anime Tracker
                </title>


                <meta
                    name="description"
                    content="Discover featured, seasonal, and top-rated anime."
                />

            </Helmet>


            {/* ==================================================
                FEATURED HERO
            ================================================== */}

            {!loading &&
            currentFeatured && (

                <section
                    className="home-hero"

                    onTouchStart={
                        handleTouchStart
                    }

                    onTouchEnd={
                        handleTouchEnd
                    }
                >

                    {/* BACKGROUND */}

                    <AnimatePresence
                        initial={false}
                        mode="sync"
                    >

                        <motion.div
                            key={
                                `hero-bg-${
                                    currentFeatured.mal_id ??
                                    currentFeatured.id
                                }`
                            }

                            className="home-hero-background"

                            initial={{
                                opacity: 0,
                                scale: 1.06,
                            }}

                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}

                            exit={{
                                opacity: 0,
                                scale: 1.025,
                            }}

                            transition={{

                                opacity: {
                                    duration: 0.65,
                                    ease: "easeInOut",
                                },

                                scale: {
                                    duration: 0.8,
                                    ease: [
                                        0.22,
                                        1,
                                        0.36,
                                        1,
                                    ],
                                },

                            }}

                            style={{
                                backgroundImage:
                                    `url("${currentFeatured.image}")`,
                            }}
                        />

                    </AnimatePresence>


                    <div
                        className="home-hero-overlay"
                    />


                    {/* HERO CONTENT */}

                    <div
                        className="home-hero-inner"
                    >

                        {/* POSTER */}

                        <div
                            className="home-hero-poster-container"
                        >

                            <AnimatePresence
                                initial={false}
                                mode="sync"
                                custom={
                                    slideDirection
                                }
                            >

                                <motion.div
                                    key={
                                        `poster-${
                                            currentFeatured.mal_id ??
                                            currentFeatured.id
                                        }`
                                    }

                                    className="home-hero-poster-stage"

                                    custom={
                                        slideDirection
                                    }

                                    initial={{
                                        opacity: 0,
                                        x:
                                            slideDirection *
                                            35,
                                        scale: 0.985,
                                    }}

                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: 1,
                                    }}

                                    exit={{
                                        opacity: 0,
                                        x:
                                            slideDirection *
                                            -35,
                                        scale: 0.985,
                                    }}

                                    transition={{

                                        opacity: {
                                            duration: 0.38,
                                            ease: "easeOut",
                                        },

                                        x: {
                                            duration: 0.48,
                                            ease: [
                                                0.22,
                                                1,
                                                0.36,
                                                1,
                                            ],
                                        },

                                        scale: {
                                            duration: 0.48,
                                            ease: [
                                                0.22,
                                                1,
                                                0.36,
                                                1,
                                            ],
                                        },

                                    }}
                                >

                                    <Link
                                        to={
                                            `/anime/${
                                                currentFeatured.mal_id ??
                                                currentFeatured.id
                                            }`
                                        }

                                        className="home-hero-poster-link"

                                        aria-label={
                                            `View ${currentFeatured.title}`
                                        }
                                    >

                                        <img
                                            src={
                                                currentFeatured.image
                                            }

                                            alt={
                                                currentFeatured.title ||
                                                "Featured anime"
                                            }

                                            className="home-hero-poster"

                                            loading="eager"

                                            decoding="async"
                                        />

                                    </Link>

                                </motion.div>

                            </AnimatePresence>

                        </div>


                        {/* INFORMATION */}

                        <AnimatePresence
                            initial={false}
                            mode="sync"
                            custom={
                                slideDirection
                            }
                        >

                            <motion.div
                                key={
                                    `content-${
                                        currentFeatured.mal_id ??
                                        currentFeatured.id
                                    }`
                                }

                                className="home-hero-content"

                                custom={
                                    slideDirection
                                }

                                initial={{
                                    opacity: 0,
                                    x:
                                        slideDirection *
                                        18,
                                    y: 4,
                                }}

                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                }}

                                exit={{
                                    opacity: 0,
                                    x:
                                        slideDirection *
                                        -18,
                                    y: -2,
                                }}

                                transition={{

                                    opacity: {
                                        duration: 0.38,
                                        ease: "easeInOut",
                                    },

                                    x: {
                                        duration: 0.42,
                                        ease: [
                                            0.22,
                                            1,
                                            0.36,
                                            1,
                                        ],
                                    },

                                    y: {
                                        duration: 0.42,
                                        ease: [
                                            0.22,
                                            1,
                                            0.36,
                                            1,
                                        ],
                                    },

                                }}
                            >

                                <span
                                    className="home-hero-eyebrow"
                                >
                                    ✦ FEATURED
                                </span>


                                <h1
                                    className="home-hero-title"
                                >
                                    {
                                        currentFeatured.title
                                    }
                                </h1>


                                <div
                                    className="home-hero-meta"
                                >

                                    {
                                        currentFeatured.score >
                                        0 && (

                                            <span>
                                                ⭐{" "}
                                                {
                                                    Number(
                                                        currentFeatured.score
                                                    ).toFixed(1)
                                                }
                                            </span>

                                        )
                                    }


                                    {
                                        currentFeatured.type && (

                                            <span>
                                                {
                                                    currentFeatured.type
                                                }
                                            </span>

                                        )
                                    }


                                    {
                                        currentFeatured.year && (

                                            <span>
                                                {
                                                    currentFeatured.year
                                                }
                                            </span>

                                        )
                                    }

                                </div>


                                {
                                    currentFeatured.genres?.length >
                                    0 && (

                                        <div
                                            className="home-hero-genres"
                                        >

                                            {
                                                currentFeatured.genres
                                                    .slice(
                                                        0,
                                                        4
                                                    )
                                                    .map(
                                                        (genre) => (

                                                            <span
                                                                key={
                                                                    genre
                                                                }
                                                            >
                                                                {
                                                                    genre
                                                                }
                                                            </span>

                                                        )
                                                    )
                                            }

                                        </div>

                                    )
                                }


                                <p
                                    className="home-hero-description"
                                >
                                    {
                                        currentFeatured.synopsis ||
                                        "Discover this anime and add it to your library."
                                    }
                                </p>


                                <div
                                    className="home-hero-actions"
                                >

                                    <Link
                                        to={
                                            `/anime/${
                                                currentFeatured.mal_id ??
                                                currentFeatured.id
                                            }`
                                        }

                                        className="home-hero-primary"
                                    >
                                        View Details
                                    </Link>


                                    <button
                                        type="button"

                                        className="home-hero-secondary"

                                        onClick={
                                            handleFeaturedFavorite
                                        }

                                        disabled={
                                            toggleFavorite.isPending
                                        }
                                    >

                                        {
                                            toggleFavorite.isPending
                                                ? "⏳ Updating..."
                                                : isFeaturedFavorite
                                                    ? "❤️ In Favorites"
                                                    : "🤍 Add to Favorites"
                                        }

                                    </button>

                                </div>

                            </motion.div>

                        </AnimatePresence>

                    </div>


                    {/* HERO NAVIGATION */}

                    {
                        featuredAnime.length >
                        1 && (

                            <>

                                <button
                                    type="button"

                                    className="
                                        home-hero-nav
                                        home-hero-prev
                                    "

                                    onClick={
                                        handlePrevious
                                    }

                                    aria-label="Previous featured anime"
                                >
                                    ←
                                </button>


                                <button
                                    type="button"

                                    className="
                                        home-hero-nav
                                        home-hero-next
                                    "

                                    onClick={
                                        handleNext
                                    }

                                    aria-label="Next featured anime"
                                >
                                    →
                                </button>


                                <div
                                    className="home-hero-dots"
                                >

                                    {
                                        featuredAnime.map(
                                            (
                                                anime,
                                                index
                                            ) => (

                                                <button
                                                    key={
                                                        anime.mal_id ??
                                                        anime.id
                                                    }

                                                    type="button"

                                                    className={
                                                        index ===
                                                        safeFeaturedIndex
                                                            ? "home-hero-dot active"
                                                            : "home-hero-dot"
                                                    }

                                                    onClick={() =>
                                                        handleDotClick(
                                                            index
                                                        )
                                                    }

                                                    aria-label={
                                                        `Show featured anime ${
                                                            index + 1
                                                        }`
                                                    }
                                                />

                                            )
                                        )
                                    }

                                </div>

                            </>

                        )
                    }

                </section>

            )}


            {/* ==================================================
                EXPLORE
            ================================================== */}

            <section
                className="home-explore"
            >

                <div
                    className="home-explore-content"
                >

                    <span
                        className="home-explore-eyebrow"
                    >
                        EXPLORE
                    </span>


                    <h2
                        className="home-explore-title"
                    >
                        Discover something new
                    </h2>


                    <p
                        className="home-explore-description"
                    >
                        Search through anime and find your
                        next favorite series.
                    </p>


                    <Link
                        to="/search"
                        className="home-explore-submit"
                    >
                        Explore Anime →
                    </Link>

                </div>


                <div
                    className="home-explore-links"
                >

                    {
                        exploreGenres.map(
                            (genre) => (

                                <Link
                                    key={
                                        genre
                                    }

                                    to={
                                        `/search?genre=${encodeURIComponent(
                                            genre
                                        )}`
                                    }

                                    className="home-explore-link"
                                >
                                    {genre}
                                </Link>

                            )
                        )
                    }

                </div>

            </section>


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            {
                loading ? (

                    <div
                        className="home-loading-grid"
                    >

                        {
                            Array.from({
                                length: 24,
                            }).map(
                                (_, index) => (

                                    <div
                                        key={
                                            index
                                        }

                                        className="
                                            home-loading-card
                                            shimmer
                                        "
                                    />

                                )
                            )
                        }

                    </div>

                ) : (

                    <>

                        {/* ==================================================
                            CURRENT SEASON + TRENDING SIDEBAR
                        ================================================== */}

                        <section className="home-trending-layout">

                            {/* ==================================================
                                CURRENT SEASON
                            ================================================== */}

                            <div className="home-trending-main">

                                <AnimeSection
                                    title="Current Season"
                                    emoji="🌸"
                                    animeList={seasonalAnime}
                                    statusMap={statusMap}
                                    favoriteIds={favoriteIds}
                                    toggleFavorite={toggleFavorite}
                                    viewAllPath="/seasonal"
                                />

                            </div>


                            {/* ==================================================
                                TRENDING SIDEBAR
                            ================================================== */}

                            {trendingSideAnime.length > 0 && (

                                <aside className="home-trending-sidebar">

                                    <div className="home-trending-sidebar-header">

                                        <div>

                                            <span className="home-trending-sidebar-eyebrow">
                                                🔥 TRENDING NOW
                                            </span>

                                            <h2>
                                                Popular right now
                                            </h2>

                                        </div>

                                        <Link
                                            to="/trending"
                                            className="home-trending-sidebar-view"
                                        >
                                            View All →
                                        </Link>

                                    </div>


                                    <div className="home-trending-sidebar-list">

                                        {trendingSideAnime.map(
                                            (anime, index) => {

                                                const animeId =
                                                    anime?.mal_id ??
                                                    anime?.id;

                                                if (animeId == null) {
                                                    return null;
                                                }

                                                return (
                                                    <Link
                                                        key={animeId}
                                                        to={`/anime/${animeId}`}
                                                        className="home-trending-sidebar-item"
                                                    >

                                                        <span className="home-trending-sidebar-rank">
                                                            {String(index + 1).padStart(2, "0")}
                                                        </span>


                                                        <div className="home-trending-sidebar-image">

                                                            <img
                                                                src={anime.image || ""}
                                                                alt=""
                                                                loading="lazy"
                                                            />

                                                        </div>


                                                        <div className="home-trending-sidebar-info">

                                                            <strong>
                                                                {anime.title}
                                                            </strong>

                                                            <span>
                                                                {anime.type}

                                                                {anime.year &&
                                                                    ` • ${anime.year}`}
                                                            </span>

                                                            {anime.score > 0 && (
                                                                <small>
                                                                    ⭐{" "}
                                                                    {Number(
                                                                        anime.score
                                                                    ).toFixed(1)}
                                                                </small>
                                                            )}

                                                        </div>


                                                        <span
                                                            className="home-trending-sidebar-arrow"
                                                            aria-hidden="true"
                                                        >
                                                            →
                                                        </span>

                                                    </Link>
                                                );
                                            }
                                        )}

                                    </div>

                                </aside>

                            )}


                            {/* ==================================================
                                TOP RATED
                            ================================================== */}

                            <div className="home-trending-lower">

                                <AnimeSection
                                    title="Top Rated Anime"
                                    emoji="⭐"
                                    animeList={topAnime}
                                    statusMap={statusMap}
                                    favoriteIds={favoriteIds}
                                    toggleFavorite={toggleFavorite}
                                    viewAllPath="/top"
                                />

                            </div>

                        </section>


                        {/* ==================================================
                            TOP RATED
                        ================================================== */}

                        <AnimeSection
                            title="Top Rated Anime"
                            emoji="⭐"

                            animeList={
                                topAnime
                            }

                            statusMap={
                                statusMap
                            }

                            favoriteIds={
                                favoriteIds
                            }

                            toggleFavorite={
                                toggleFavorite
                            }

                            viewAllPath="/top"
                        />

                    </>

                )
            }

        </PageContainer>
    );
}


export default Home;

