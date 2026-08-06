import { useAnimeFeed } from "../../hooks/anime/useAnimeFeed";
import AnimeCard from "../../components/AnimeCard";
import { useFavorites } from "../../hooks/user/useFavorites";

function SeasonalSection() {

    const { data, isLoading } = useAnimeFeed("seasonal");
    const { data: favorites = [] } = useFavorites();

    const items = data?.pages?.flatMap(p => p.items) || [];

    const favoriteIds = new Set(
        favorites.map(f =>
            String(f.anime_id ?? f.id ?? f.mal_id)
        )
    );

    if (isLoading) return null;

    return (
        <Section title="🌸 Seasonal">

            <div className="grid">

                {items.map(anime => {

                    const id = String(anime.id ?? anime.mal_id);

                    return (
                        <AnimeCard
                            key={id}
                            anime={anime}
                            isFavorited={favoriteIds.has(id)}
                        />
                    );
                })}

            </div>

        </Section>
    );
}

export default SeasonalSection;