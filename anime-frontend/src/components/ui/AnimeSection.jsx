
import {
    useMemo,
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import AnimeCard from "../AnimeCard";


export default function AnimeSection({
    title,
    emoji,
    animeList,
    statusMap,
    favoriteIds,
    toggleFavorite,
}) {

    // ============================================================
    // CONSTANTS
    // ============================================================

    const CARDS_PER_PAGE = 4;


    // ============================================================
    // SAFE FAVORITE IDS
    // ============================================================

    const safeFavoriteIds =
        favoriteIds instanceof Set
            ? favoriteIds
            : new Set(
                Array.isArray(favoriteIds)
                    ? favoriteIds.map(String)
                    : []
            );


    // ============================================================
    // VALID ANIME
    // ============================================================

    const validAnime =
        useMemo(
            () => {

                const list =
                    Array.isArray(animeList)
                        ? animeList
                        : [];


                return list.filter(
                    (anime) => {

                        const animeId =
                            anime?.mal_id ??
                            anime?.id;

                        return animeId != null;
                    }
                );

            },
            [animeList]
        );


    // ============================================================
    // SLIDER STATE
    // ============================================================

    const [
        currentPage,
        setCurrentPage,
    ] = useState(0);


    const [
        slideDirection,
        setSlideDirection,
    ] = useState(1);


    // ============================================================
    // PAGE INFORMATION
    // ============================================================

    const totalPages =
        Math.ceil(
            validAnime.length /
            CARDS_PER_PAGE
        );


    const hasMultiplePages =
        totalPages > 1;


    const isFirstPage =
        currentPage === 0;


    const isLastPage =
        currentPage >=
        totalPages - 1;


    // ============================================================
    // VISIBLE ANIME
    // ============================================================

    const visibleAnime =
        validAnime.slice(
            currentPage * CARDS_PER_PAGE,
            (currentPage + 1) * CARDS_PER_PAGE
        );


    // ============================================================
    // NAVIGATION
    // ============================================================

    const handlePrevious = () => {

        if (isFirstPage) {
            return;
        }


        setSlideDirection(-1);


        setCurrentPage(
            (current) =>
                Math.max(
                    current - 1,
                    0
                )
        );
    };


    const handleNext = () => {

        if (isLastPage) {
            return;
        }


        setSlideDirection(1);


        setCurrentPage(
            (current) =>
                Math.min(
                    current + 1,
                    totalPages - 1
                )
        );
    };


    // ============================================================
    // SLIDE ANIMATION
    // ============================================================

    const slideVariants = {

        enter: (direction) => ({
            x:
                direction > 0
                    ? 45
                    : -45,

            opacity: 0,
        }),


        center: {
            x: 0,
            opacity: 1,
        },


        exit: (direction) => ({
            x:
                direction > 0
                    ? -45
                    : 45,

            opacity: 0,
        }),

    };


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <section className="home-section">

            {/* ==================================================
                SECTION HEADER
            ================================================== */}

            <div className="section-header">

                <div className="section-heading">

                    <span className="section-emoji">
                        {emoji}
                    </span>


                    <h2>
                        {title}
                    </h2>

                </div>


                {/* ==================================================
                    SLIDER CONTROLS
                ================================================== */}

                {hasMultiplePages && (

                    <div className="section-slider-controls">

                        <button
                            type="button"

                            className={
                                `section-slider-btn ${
                                    isFirstPage
                                        ? "disabled"
                                        : ""
                                }`
                            }

                            onClick={
                                handlePrevious
                            }

                            disabled={
                                isFirstPage
                            }

                            aria-label={
                                `Previous ${title.toLowerCase()}`
                            }
                        >
                            ←
                        </button>


                        <button
                            type="button"

                            className={
                                `section-slider-btn ${
                                    isLastPage
                                        ? "disabled"
                                        : ""
                                }`
                            }

                            onClick={
                                handleNext
                            }

                            disabled={
                                isLastPage
                            }

                            aria-label={
                                `Next ${title.toLowerCase()}`
                            }
                        >
                            →
                        </button>

                    </div>

                )}

            </div>


            {/* ==================================================
                ANIME CARDS
            ================================================== */}

            <div className="anime-section-slider">

                <AnimatePresence
                    initial={false}
                    mode="wait"
                    custom={
                        slideDirection
                    }
                >

                    <motion.div
                        key={
                            currentPage
                        }

                        className="anime-section-grid"

                        custom={
                            slideDirection
                        }

                        variants={
                            slideVariants
                        }

                        initial="enter"

                        animate="center"

                        exit="exit"

                        transition={{
                            x: {
                                duration: 0.38,
                                ease: [
                                    0.22,
                                    1,
                                    0.36,
                                    1,
                                ],
                            },

                            opacity: {
                                duration: 0.25,
                                ease: "easeOut",
                            },
                        }}
                    >

                        {visibleAnime.map(
                            (anime) => {

                                const animeId =
                                    anime.mal_id ??
                                    anime.id;


                                const normalizedAnimeId =
                                    String(
                                        animeId
                                    );


                                return (
                                    <AnimeCard
                                        key={
                                            normalizedAnimeId
                                        }

                                        anime={
                                            anime
                                        }

                                        statusMap={
                                            statusMap
                                        }

                                        isFavorited={
                                            safeFavoriteIds.has(
                                                normalizedAnimeId
                                            )
                                        }

                                        isFavoritePending={
                                            toggleFavorite?.isPending ??
                                            false
                                        }

                                        onToggleFavorite={() =>
                                            toggleFavorite.mutate({

                                                anime_id:
                                                    anime.mal_id ??
                                                    anime.id,

                                                title:
                                                    anime.title ??
                                                    "",

                                                image:
                                                    anime.image ??
                                                    "",

                                            })
                                        }
                                    />
                                );
                            }
                        )}

                    </motion.div>

                </AnimatePresence>

            </div>

        </section>
    );
}

