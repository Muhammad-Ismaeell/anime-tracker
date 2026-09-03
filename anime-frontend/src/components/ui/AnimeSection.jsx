import {
    useMemo,
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import AnimeCard from "../AnimeCard";
import { getAnimeId } from "../../utils/normalizeAnime";

import "./AnimeSection.css";


export default function AnimeSection({
    title,
    emoji,
    animeList,
    statusMap,
    favoriteIds,
    toggleFavorite,
}) {

    // Match the eight-card desktop grid so cards never wrap onto a second row.
    const CARDS_PER_PAGE = 8;

    const safeFavoriteIds =
        favoriteIds instanceof Set
            ? favoriteIds
            : new Set(
                Array.isArray(favoriteIds)
                    ? favoriteIds.map(String)
                    : []
            );

    const validAnime = useMemo(() => {
        const list = Array.isArray(animeList) ? animeList : [];

        return list
            .map((anime) => ({
                anime,
                id: getAnimeId(anime),
            }))
            .filter(({ id }) => id != null);
    }, [animeList]);

    const [currentPage, setCurrentPage] = useState(0);
    const [slideDirection, setSlideDirection] = useState(1);

    const totalPages = Math.ceil(validAnime.length / CARDS_PER_PAGE);
    const hasMultiplePages = totalPages > 1;
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage >= totalPages - 1;

    const visibleAnime = validAnime.slice(
        currentPage * CARDS_PER_PAGE,
        (currentPage + 1) * CARDS_PER_PAGE
    );

    const handlePrevious = () => {
        if (isFirstPage) return;
        setSlideDirection(-1);
        setCurrentPage((current) => Math.max(current - 1, 0));
    };

    const handleNext = () => {
        if (isLastPage) return;
        setSlideDirection(1);
        setCurrentPage((current) =>
            Math.min(current + 1, totalPages - 1)
        );
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 45 : -45,
            opacity: 0,
        }),
        center: { x: 0, opacity: 1 },
        exit: (direction) => ({
            x: direction > 0 ? -45 : 45,
            opacity: 0,
        }),
    };

    return (
        <section className="home-section">
            <div className="section-header">
                <div className="section-heading">
                    <span className="section-emoji" aria-hidden="true">
                        {emoji}
                    </span>
                    <h2>{title}</h2>
                </div>

                {hasMultiplePages && (
                    <div className="section-slider-controls">
                        <button
                            type="button"
                            className="section-slider-btn"
                            onClick={handlePrevious}
                            disabled={isFirstPage}
                            aria-label={`Previous ${title.toLowerCase()}`}
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            className="section-slider-btn"
                            onClick={handleNext}
                            disabled={isLastPage}
                            aria-label={`Next ${title.toLowerCase()}`}
                        >
                            →
                        </button>
                    </div>
                )}
            </div>

            <div className="anime-section-slider">
                <AnimatePresence
                    initial={false}
                    mode="wait"
                    custom={slideDirection}
                >
                    <motion.div
                        key={currentPage}
                        className="anime-section-grid"
                        custom={slideDirection}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: {
                                duration: 0.28,
                                ease: [0.22, 1, 0.36, 1],
                            },
                            opacity: {
                                duration: 0.2,
                                ease: "easeOut",
                            },
                        }}
                    >
                        {visibleAnime.map(({ anime, id }) => {
                            const normalizedAnimeId = String(id);

                            return (
                                <AnimeCard
                                    key={normalizedAnimeId}
                                    anime={anime}
                                    statusMap={statusMap}
                                    isFavorited={safeFavoriteIds.has(normalizedAnimeId)}
                                    isFavoritePending={toggleFavorite?.isPending ?? false}
                                    onToggleFavorite={() =>
                                        toggleFavorite.mutate({
                                            anime_id: id,
                                            title: anime.title ?? "",
                                            image: anime.image ?? "",
                                        })
                                    }
                                />
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
