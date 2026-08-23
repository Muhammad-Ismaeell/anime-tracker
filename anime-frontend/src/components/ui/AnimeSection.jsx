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
    return (
        <section className="home-section">
            <div className="section-header">
                <div className="section-heading">
                    <span className="section-emoji">
                        {emoji}
                    </span>

                    <h2>{title}</h2>
                </div>

                {viewAllPath && (
                    <Link
                        to={viewAllPath}
                        className="view-all-btn"
                    >
                        View All
                        <span aria-hidden="true">
                            →
                        </span>
                    </Link>
                )}
            </div>

            <div className="grid">
                {animeList
                    .slice(0, 8)
                    .map((anime) => {

                        return (
                            <AnimeCard
                                key={anime.id}
                                anime={anime}
                                statusMap={statusMap}
                                isFavorited={favoriteIds.has(
                                    String(anime.mal_id)
                                )}
                                isFavoritePending={
                                    toggleFavorite.isPending
                                }
                                onToggleFavorite={() =>
                                    toggleFavorite.mutate({
                                        anime_id: anime.mal_id,
                                        title: anime.title,
                                        image: anime.image || "",
                                    })
                                }
                            />
                        );
                    })}
            </div>
        </section>
    );
}