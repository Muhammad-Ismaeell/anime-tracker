import { useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import EmptyState from "../components/ui/EmptyState";
import OptimizedImage from "../components/ui/OptimizedImage";
import PageContainer from "../components/ui/PageContainer";
import { AnimeAPI } from "../api/anime.api";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import "../styles/recommendations.css";

function Characters() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { library } = useGlobalLibrary();
    const sourceAnime = useMemo(
        () =>
            library
                .map((item) => item.anime)
                .filter((anime) => anime?.id || anime?.mal_id)
                .slice(0, 6),
        [library]
    );

    const queries = useQueries({
        queries: sourceAnime.map((anime) => {
            const id = anime.id ?? anime.mal_id;
            return {
                queryKey: ["anime-characters", id],
                queryFn: async () => {
                    const data = await AnimeAPI.characters(id);
                    return data?.items ?? [];
                },
                staleTime: 1000 * 60 * 60,
            };
        }),
    });

    const characters = useMemo(() => {
        const seen = new Set();
        return queries
            .flatMap((query) => query.data ?? [])
            .filter((character) => {
                const id = String(character.id ?? character.name);
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
            })
            .slice(0, 30);
    }, [queries]);

    const isLoading = sourceAnime.length > 0 && queries.some((query) => query.isLoading);
    const isError = sourceAnime.length > 0 && queries.every((query) => query.isError);

    return (
        <PageContainer>
            <Helmet>
                <title>Characters | Anime Tracker</title>
                <meta name="description" content="Explore characters from anime in your library." />
            </Helmet>

            <div className="recommendations-header">
                <span className="recommendations-eyebrow">EXPLORE</span>
                <h1>Characters</h1>
                <p>Explore characters from the anime in your library.</p>
            </div>

            {sourceAnime.length === 0 ? (
                <EmptyState text="Add some anime to your library to explore characters." icon="👥" />
            ) : isLoading ? (
                <div className="characters-grid">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div className="character-skeleton" key={index} />
                    ))}
                </div>
            ) : isError || characters.length === 0 ? (
                <EmptyState text="No characters found right now." icon="👥" />
            ) : (
                <div className="characters-grid">
                    {characters.map((character) => {
                        const image = character.image || "/no-image.png";
                        const voiceActor = character.voice_actors?.[0]?.name;

                        return (
                            <article className="character-card" key={character.id ?? character.name}>
                                <div className="character-image">
                                    <OptimizedImage src={image} alt={character.name} loading="lazy" />
                                </div>
                                <div className="character-info">
                                    <h3>{character.name}</h3>
                                    {character.role && <span className="character-role">{character.role}</span>}
                                    {voiceActor && <span className="character-voice">{voiceActor}</span>}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </PageContainer>
    );
}

export default Characters;
