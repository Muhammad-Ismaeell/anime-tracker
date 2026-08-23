import { useAnimeFeed } from "../../hooks/anime/useAnimeFeed";
import AnimeCard from "../../components/AnimeCard";
import { useFavorites } from "../../hooks/user/useFavorites";
import Section from "../../components/ui/Section";
import ErrorState from "../../components/ui/ErrorState";
import AnimeCardSkeleton from "../../components/ui/AnimeCardSkeleton";
import EmptyState from "../../components/ui/EmptyState";
function TopSection() {

    const { data, isLoading, isError } = useAnimeFeed("top");
    const { data: favorites = [] } = useFavorites();

    const items = data?.pages?.flatMap(p => p.items) || [];

    const favoriteIds = new Set(
        favorites.map(f =>
            String(f.anime_id ?? f.id ?? f.mal_id)
        )
    );

    if (isLoading) {
        return (
            <Section title="⭐ Top Anime">

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
            <Section title="⭐ Top Anime">
                <ErrorState text="Failed loading top anime" />
            </Section>
        );
    }
    if (!items.length) {
        return (
            <Section title="🔥 Top">
                <EmptyState text="No Top anime found" />
            </Section>
        );
    }

    return (
        <Section title="⭐ Top Anime">

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

export default TopSection;