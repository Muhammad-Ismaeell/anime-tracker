import { useAnimeCharacters } from "../../hooks/useAnimeCharacters";
import OptimizedImage from "../ui/OptimizedImage";

import "./CharactersSection.css";


function CharactersSection({ animeId }) {
    const {
        data: characters = [],
        isLoading,
        isError,
    } = useAnimeCharacters(animeId);

    if (!isLoading && (isError || characters.length === 0)) {
        return null;
    }

    return (
        <section className="detail-characters anime-section">
            <div className="detail-section-heading">
                <h2>Characters</h2>
            </div>

            {isLoading ? (
                <div className="characters-grid">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            className="character-skeleton"
                            key={index}
                        />
                    ))}
                </div>
            ) : (
                <div className="characters-grid">
                    {characters.slice(0, 12).map((character) => {
                        const image = character.image || "/no-image.png";
                        const voiceActor = character.voice_actors?.[0]?.name;

                        return (
                            <article
                                className="character-card"
                                key={character.id}
                            >
                                <div className="character-image">
                                    <OptimizedImage
                                        src={image}
                                        alt={character.name}
                                        loading="lazy"
                                    />
                                </div>

                                <div className="character-info">
                                    <h3>{character.name}</h3>

                                    {character.role && (
                                        <span className="character-role">
                                            {character.role}
                                        </span>
                                    )}

                                    {voiceActor && (
                                        <span className="character-voice">
                                            {voiceActor}
                                        </span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}


export default CharactersSection;
