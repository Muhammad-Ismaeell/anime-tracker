import AnimeCard from "../AnimeCard";
import { useToggleFavorite } from "../../hooks/user/useFavorites";
import { useFavoriteIds } from "../../hooks/user/useFavoriteIds";
import { useAnimeRecommendations } from "../../hooks/useAnimeRecommendations";

import CharactersSection from "./CharactersSection";
import EpisodesSection from "./EpisodesSection";
import StaffSection from "./StaffSection";
import StatisticsSection from "./StatisticsSection";
import RelationsSection from "./RelationsSection";
import ThemesSection from "./ThemesSection";

import "./RecommendationsSection.css";


function RecommendationsSection({ animeId }) {
    const {
        data: recommendations = [],
        isLoading,
        isError,
    } = useAnimeRecommendations(animeId);

    const favoriteIds = useFavoriteIds();
    const toggleFavorite = useToggleFavorite();

    return (
        <>
            <EpisodesSection animeId={animeId} />
            <CharactersSection animeId={animeId} />
            <StaffSection animeId={animeId} />
            <StatisticsSection animeId={animeId} />
            <RelationsSection animeId={animeId} />
            <ThemesSection animeId={animeId} />

            {isLoading ? (
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
            ) : isError || recommendations.length === 0 ? (
                null
            ) : (
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
            )}
        </>
    );
}


export default RecommendationsSection;
