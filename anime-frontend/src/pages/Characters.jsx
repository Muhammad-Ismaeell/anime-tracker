import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import EmptyState from "../components/ui/EmptyState";
import OptimizedImage from "../components/ui/OptimizedImage";
import PageContainer from "../components/ui/PageContainer";
import { AnimeAPI } from "../api/anime.api";

import "../components/detail/CharactersSection.css";
import "../styles/recommendations.css";

function Characters() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["general-characters"],
        queryFn: () => AnimeAPI.generalCharacters(),
        staleTime: 1000 * 60 * 60,
    });

    const characters = data?.items ?? [];

    return (
        <PageContainer>
            <Helmet>
                <title>Characters | Anime Tracker</title>
                <meta
                    name="description"
                    content="Explore anime characters from across the catalogue."
                />
            </Helmet>

            <div className="recommendations-header">
                <span className="recommendations-eyebrow">EXPLORE</span>
                <h1>Characters</h1>
                <p>Meet characters from anime across the catalogue.</p>
            </div>

            {isLoading ? (
                <div className="characters-grid">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div className="character-skeleton" key={index} />
                    ))}
                </div>
            ) : isError || characters.length === 0 ? (
                <EmptyState text="No characters found right now." icon="👥" />
            ) : (
                <div className="characters-grid">
                    {characters.map((character) => (
                        <article className="character-card" key={character.id}>
                            <div className="character-image">
                                <OptimizedImage
                                    src={character.image || "/no-image.png"}
                                    alt={character.name}
                                    loading="lazy"
                                />
                            </div>
                            <div className="character-info">
                                <h3>{character.name}</h3>
                                {character.favorites > 0 && (
                                    <span className="character-voice">
                                        ♥ {character.favorites.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}

export default Characters;
