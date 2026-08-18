import { useAnimeFeed } from "../../hooks/anime/useAnimeFeed";
import AnimeCard from "../../components/AnimeCard";
import { useFavorites } from "../../hooks/user/useFavorites";
import Section from "../../components/ui/Section";
function TrendingSection() {

    const { data, isLoading } = useAnimeFeed("trending");
    const { data: favorites = [] } = useFavorites();

    const items = data?.pages?.flatMap(p => p.items) || [];

    const favoriteIds = new Set(
        favorites.map(f =>
            String(f.anime_id ?? f.id ?? f.mal_id)
        )
    );

    if (isLoading) return null;

    return (
        <Section title="🔥 Trending">

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

export default TrendingSection;