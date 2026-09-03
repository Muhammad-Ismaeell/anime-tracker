import { useMemo } from "react";

import { Link } from "react-router-dom";

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
    viewAllTo,
    variant = "grid",
}) {

    const CARDS_PER_PAGE = 8;
    const RANKING_ITEMS = 8;

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

    if (variant === "ranking") {
        return (
            <section className="home-section home-section-ranking">
                <div className="section-header">
                    <div className="section-heading">
                        <span className="section-emoji" aria-hidden="true">
                            {emoji}
                        </span>
                        <h2>{title}</h2>
                    </div>

                    {viewAllTo && (
                        <Link className="section-view-all" to={viewAllTo}>
                            View All
                        </Link>
                    )}
                </div>

                <div className="anime-ranking-list">
                    {validAnime.slice(0, RANKING_ITEMS).map(({ anime, id }, index) => (
                        <Link
                            key={String(id)}
                            to={`/anime/${id}`}
                            className="anime-ranking-item"
                        >
                            <span className="anime-ranking-number">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <img
                                src={anime.image}
                                alt=""
                                className="anime-ranking-image"
                                loading="lazy"
                            />

                            <span className="anime-ranking-info">
                                <strong>{anime.title || "Unknown Anime"}</strong>
                                <span>
                                    {anime.type || "Anime"}
                                    {anime.year ? ` • ${anime.year}` : ""}
                                </span>
                            </span>

                            {Number(anime.score) > 0 && (
                                <span className="anime-ranking-score">
                                    ⭐ {Number(anime.score).toFixed(1)}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </section>
        );
    }

    const visibleAnime = validAnime.slice(0, CARDS_PER_PAGE);

    return (
        <section className="home-section">
            <div className="section-header">
                <div className="section-heading">
                    <span className="section-emoji" aria-hidden="true">
                        {emoji}
                    </span>
                    <h2>{title}</h2>
                </div>

                {viewAllTo && (
                    <Link className="section-view-all" to={viewAllTo}>
                        View All
                    </Link>
                )}
            </div>

            <div className="anime-section-slider">
                <div className="grid">
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
                </div>
            </div>
        </section>
    );
}
