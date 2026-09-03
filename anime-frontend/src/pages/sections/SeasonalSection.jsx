import { useAnimeFeed } from "../../hooks/anime/useAnimeFeed";
import AnimeCard from "../../components/AnimeCard";
import { useFavorites } from "../../hooks/user/useFavorites";
import Section from "../../components/ui/Section";
import ErrorState from "../../components/ui/ErrorState";
import AnimeCardSkeleton from "../../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../../components/ui/EmptyState";
function SeasonalSection() {

    const { data, isLoading, isError } = useAnimeFeed("seasonal");
    const { data: favorites = [] } = useFavorites();

    const items = data?.pages?.flatMap(p => p.items) || [];

    const favoriteIds = new Set(
        favorites.map(f =>
            String(f.anime_id ?? f.id ?? f.mal_id)
        )
    );

    if (isLoading) {
        return (
            <Section title="🌸 Seasonal">

                <div className="grid">

                    {Array.from({ length: 6 }).map((_, index) => (
                        <AnimeCardSkeleton key={index} />
                    ))}

                </div>

            </Section>
        );
    }

    if (isError) {
        return (
            <Section title="🌸 Seasonal">
                <ErrorState text="Failed loading seasonal anime" />
            </Section>
        );
    }
    if (!items.length) {
        return (
            <Section title="🔥 Seasonal">
                <EmptyState text="No seasonal anime found" />
            </Section>
        );
    }

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