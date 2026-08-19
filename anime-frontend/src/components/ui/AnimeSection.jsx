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
                <h1>
                    {emoji} {title}
                </h1>

                {viewAllPath && (
                    <Link
                        to={viewAllPath}
                        className="view-all-btn"
                    >
                        View All →
                    </Link>
                )}
            </div>

            <div className="grid">
                {animeList.slice(0, 8).map((anime) => (
                    <AnimeCard
                        key={anime.id}
                        anime={anime}
                        statusMap={statusMap}
                        isFavorited={favoriteIds.has(
                            String(anime.id)
                        )}
                        isFavoritePending={
                            toggleFavorite.isPending
                        }
                        onToggleFavorite={() =>
                            toggleFavorite.mutate({
                                anime_id: anime.id,
                                title: anime.title,
                                image: anime.image || "",
                            })
                        }
                    />
                ))}
            </div>
        </section>
    );
}