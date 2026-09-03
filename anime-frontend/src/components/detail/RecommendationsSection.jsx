import AnimeCard from "../AnimeCard";
import { useToggleFavorite } from "../../hooks/user/useFavorites";
import { useFavoriteIds } from "../../hooks/user/useFavoriteIds";
import { useAnimeRecommendations } from "../../hooks/useAnimeRecommendations";

import "./RecommendationsSection.css";


function RecommendationsSection({ animeId }) {
    const {
        data: recommendations = [],
        isLoading,
        isError,
    } = useAnimeRecommendations(animeId);

    const favoriteIds = useFavoriteIds();
    const toggleFavorite = useToggleFavorite();

    if (isLoading) {
        return (
            <section className="detail-recommendations anime-section">
                <div className="detail-section-heading">
                    <h2>Recommendations</h2>
                </div>

                <div className="detail-recommendations-grid">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            className="detail-recommendation-skeleton"
                            key={index}
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (isError || recommendations.length === 0) {
        return null;
    }

    return (
        <section className="detail-recommendations anime-section">
            <div className="detail-section-heading">
                <h2>Recommendations</h2>
            </div>

            <div className="detail-recommendations-grid">
                {recommendations.slice(0, 8).map((recommendation) => {
                    const id = String(recommendation.id);

                    return (
                        <AnimeCard
                            key={id}
                            anime={recommendation}
                            isFavorited={favoriteIds.has(id)}
                            onToggleFavorite={toggleFavorite.mutate}
                            isFavoritePending={toggleFavorite.isPending}
                        />
                    );
                })}
            </div>
        </section>
    );
}


export default RecommendationsSection;
