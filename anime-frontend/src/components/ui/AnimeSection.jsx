
import { Link } from "react-router-dom";
import AnimeCard from "../AnimeCard";

export default function AnimeSection({
    title,
    emoji,
    animeList,
    statusMap,
    favoriteIds,
    toggleFavorite,
    viewAllPath,
}) {
    const safeAnimeList = Array.isArray(animeList)
        ? animeList
        : [];

    const safeFavoriteIds =
        favoriteIds instanceof Set
            ? favoriteIds
            : new Set(
                  Array.isArray(favoriteIds)
                      ? favoriteIds.map(String)
                      : []
              );

    const visibleAnime = safeAnimeList
        .filter((anime) => {
            const animeId =
                anime?.mal_id ??
                anime?.id;

            return animeId != null;
        })
        .slice(0,4);

    return (
        <section className="home-section">

            <div className="section-header">

                <div className="section-heading">

                    <span className="section-emoji">
                        {emoji}
                    </span>

                    <h2>
                        {title}
                    </h2>

                </div>


                {viewAllPath && (
                    <Link
                        to={viewAllPath}
                        className="view-all-btn"
                    >
                        <span>
                            View All
                        </span>

                        <span aria-hidden="true">
                            →
                        </span>
                    </Link>
                )}

            </div>


            <div className="anime-section-grid">

                {visibleAnime.map((anime) => {

                    const animeId =
                        anime.mal_id ??
                        anime.id;

                    const normalizedAnimeId =
                        String(animeId);

                    return (
                        <AnimeCard
                            key={normalizedAnimeId}

                            anime={anime}

                            statusMap={statusMap}

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
                })}

            </div>

        </section>
    );
}

