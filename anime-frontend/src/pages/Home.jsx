import {
    useMemo,
    useState,
} from "react";

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";

import PageContainer from "../components/ui/PageContainer";
import AnimeSection from "../components/ui/AnimeSection";
import EmptyState from "../components/ui/EmptyState";
import DiscoverGenres from "../components/ui/DiscoverGenres";

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
    // STATIC FEATURED ANIME
    //
    // Prefer the first seasonal anime with an image, then fall
    // back to the first top-rated anime with an image.
    // ============================================================

    const featuredAnime = useMemo(
        () => {
            const seasonalFeatured =
                seasonalAnime.find(
                    (anime) => anime?.image
                );

            if (seasonalFeatured) {
                return seasonalFeatured;
            }

            return topAnime.find(
                (anime) => anime?.image
            );
        },
        [
            seasonalAnime,
            topAnime,
        ]
    );


    // ============================================================
    // TRENDING SIDEBAR STATE
    // ============================================================

    const [
        trendingVisibleCount,
        setTrendingVisibleCount,
    ] = useState(8);


    const trendingSideAnime =
        useMemo(
            () =>
                trendingAnime.slice(
                    0,
                    trendingVisibleCount
                ),
            [
                trendingAnime,
                trendingVisibleCount,
            ]
        );


    // ============================================================
    // TRENDING VIEW MORE / VIEW LESS
    // ============================================================

    const handleTrendingToggle = () => {

        if (
            trendingVisibleCount === 8
        ) {

            setTrendingVisibleCount(
                Math.min(
                    24,
                    trendingAnime.length
                )
            );

            return;
        }


        setTrendingVisibleCount(8);
    };


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
                STATIC FEATURED PANEL
            ================================================== */}

            {!loading &&
            featuredAnime && (

                <section
                    className="home-hero"
                >

                    <div
                        className="home-hero-background"
                        style={{
                            backgroundImage:
                                `url("${featuredAnime.image}")`,
                        }}
                        aria-hidden="true"
                    />


                    <div
                        className="home-hero-overlay"
                        aria-hidden="true"
                    />


                    <div
                        className="home-hero-inner"
                    >

                        <div
                            className="home-hero-poster-container"
                        >

                            <Link
                                to={
                                    `/anime/${
                                        featuredAnime.mal_id ??
                                        featuredAnime.id
                                    }`
                                }

                                className="home-hero-poster-link"

                                aria-label={
                                    `View ${featuredAnime.title}`
                                }
                            >

                                <img
                                    src={
                                        featuredAnime.image
                                    }

                                    alt={
                                        featuredAnime.title ||
                                        "Featured anime"
                                    }

                                    className="home-hero-poster"

                                    loading="eager"

                                    decoding="async"
                                />

                            </Link>

                        </div>


                        <div
                            className="home-hero-content"
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
                                    featuredAnime.title
                                }
                            </h1>


                            <div
                                className="home-hero-meta"
                            >

                                {
                                    featuredAnime.score >
                                    0 && (

                                        <span>
                                            ⭐{" "}
                                            {
                                                Number(
                                                    featuredAnime.score
                                                ).toFixed(1)
                                            }
                                        </span>

                                    )
                                }


                                {
                                    featuredAnime.type && (

                                        <span>
                                            {
                                                featuredAnime.type
                                            }
                                        </span>

                                    )
                                }


                                {
                                    featuredAnime.year && (

                                        <span>
                                            {
                                                featuredAnime.year
                                            }
                                        </span>

                                    )
                                }

                            </div>


                            {
                                featuredAnime.genres?.length >
                                0 && (

                                    <div
                                        className="home-hero-genres"
                                    >

                                        {
                                            featuredAnime.genres
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
                                    featuredAnime.synopsis ||
                                    "Discover this anime and add it to your library."
                                }
                            </p>


                            <div
                                className="home-hero-actions"
                            >

                                <Link
                                    to={
                                        `/anime/${
                                            featuredAnime.mal_id ??
                                            featuredAnime.id
                                        }`
                                    }

                                    className="home-hero-primary-action"
                                >
                                    View Anime
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* ==================================================
                DISCOVER
            ================================================== */}

            <DiscoverGenres />


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

                        <section
                            className="home-trending-layout"
                        >

                            {/* MAIN */}

                            <div
                                className="home-trending-main"
                            >

                                <AnimeSection
                                    title="Current Season"
                                    emoji="🌸"
                                    animeList={
                                        seasonalAnime
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
                                />


                                <div
                                    className="home-trending-lower"
                                >

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
                                    />

                                </div>

                            </div>


                            {/* TRENDING SIDEBAR */}

                            {
                                trendingSideAnime.length >
                                0 && (

                                    <aside
                                        className="home-trending-sidebar"
                                    >

                                        <div
                                            className="
                                                home-trending-sidebar-header
                                            "
                                        >

                                            <div>

                                                <span
                                                    className="
                                                        home-trending-sidebar-eyebrow
                                                    "
                                                >
                                                    🔥 TRENDING NOW
                                                </span>

                                                <h2>
                                                    Popular right now
                                                </h2>

                                            </div>

                                        </div>


                                        <div
                                            className="
                                                home-trending-sidebar-list
                                            "
                                        >

                                            {
                                                trendingSideAnime.map(
                                                    (
                                                        anime,
                                                        index
                                                    ) => {

                                                        const animeId =
                                                            anime?.mal_id ??
                                                            anime?.id;


                                                        if (
                                                            animeId ==
                                                            null
                                                        ) {
                                                            return null;
                                                        }


                                                        return (

                                                            <Link
                                                                key={
                                                                    animeId
                                                                }

                                                                to={
                                                                    `/anime/${animeId}`
                                                                }

                                                                className="
                                                                    home-trending-sidebar-item
                                                                "
                                                            >

                                                                <span
                                                                    className="
                                                                        home-trending-sidebar-rank
                                                                    "
                                                                >
                                                                    {
                                                                        String(
                                                                            index + 1
                                                                        ).padStart(
                                                                            2,
                                                                            "0"
                                                                        )
                                                                    }
                                                                </span>


                                                                <div
                                                                    className="
                                                                        home-trending-sidebar-image
                                                                    "
                                                                >

                                                                    <img
                                                                        src={
                                                                            anime.image ||
                                                                            ""
                                                                        }

                                                                        alt=""

                                                                        loading="lazy"
                                                                    />

                                                                </div>


                                                                <div
                                                                    className="
                                                                        home-trending-sidebar-info
                                                                    "
                                                                >

                                                                    <strong>
                                                                        {
                                                                            anime.title
                                                                        }
                                                                    </strong>


                                                                    <span>

                                                                        {
                                                                            anime.type
                                                                        }

                                                                        {
                                                                            anime.year &&
                                                                            ` • ${anime.year}`
                                                                        }

                                                                    </span>


                                                                    {
                                                                        anime.score >
                                                                        0 && (

                                                                            <small>
                                                                                ⭐{" "}
                                                                                {
                                                                                    Number(
                                                                                        anime.score
                                                                                    ).toFixed(
                                                                                        1
                                                                                    )
                                                                                }
                                                                            </small>

                                                                        )
                                                                    }

                                                                </div>


                                                                <span
                                                                    className="
                                                                        home-trending-sidebar-arrow
                                                                    "

                                                                    aria-hidden="true"
                                                                >
                                                                    →
                                                                </span>

                                                            </Link>

                                                        );
                                                    }
                                                )
                                            }

                                        </div>


                                        {
                                            trendingAnime.length >
                                            8 && (

                                                <button
                                                    type="button"

                                                    className="
                                                        home-trending-sidebar-more
                                                    "

                                                    onClick={
                                                        handleTrendingToggle
                                                    }

                                                    aria-label={
                                                        trendingVisibleCount === 8
                                                            ? "Show more trending anime"
                                                            : "Show fewer trending anime"
                                                    }
                                                >

                                                    <span
                                                        aria-hidden="true"
                                                    >
                                                        {
                                                            trendingVisibleCount === 8
                                                                ? "↓"
                                                                : "↑"
                                                        }
                                                    </span>

                                                </button>

                                            )
                                        }

                                    </aside>

                                )
                            }

                        </section>

                    </>

                )
            }

        </PageContainer>
    );
}


export default Home;
