import { Helmet } from "react-helmet-async";

import PageContainer from "../components/ui/PageContainer";
import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";

import {
    useFavorites,
    useToggleFavorite,
} from "../hooks/user/useFavorites";

import { useGlobalLibrary } from "../hooks/useGlobalLibrary";


function Favorites() {
    const {
        data,
        isLoading,
        error,
        refetch,
    } = useFavorites();

    const toggleFavorite = useToggleFavorite();

    const { statusMap } = useGlobalLibrary();

    const favorites = data?.results ?? [];


    if (isLoading) {
        return (
            <PageContainer>
                <div className="section-header">
                    <h1>❤️ My Favorites</h1>
                </div>

                <div className="grid">
                    {Array.from({ length: 12 }).map(
                        (_, index) => (
                            <AnimeCardSkeleton
                                key={index}
                            />
                        )
                    )}
                </div>
            </PageContainer>
        );
    }


    if (error) {
        return (
            <PageContainer>
                <EmptyState
                    text="Failed to load favorites."
                />

                <button
                    type="button"
                    className="retry-btn"
                    onClick={() => refetch()}
                >
                    Retry
                </button>
            </PageContainer>
        );
    }


    return (
        <>
            <Helmet>
                <title>
                    My Favorites | Anime Tracker
                </title>

                <meta
                    name="description"
                    content="View and manage your favorite anime."
                />
            </Helmet>

            <PageContainer>
                <div className="section-header">
                    <h1>❤️ My Favorites</h1>
                </div>

                {favorites.length === 0 ? (
                    <EmptyState
                        text="You haven't added any favorite anime yet."
                        icon="❤️"
                    />
                ) : (
                    <div className="grid">
                        {favorites.map((item) => {
                            const anime = item.anime;

                            const animeId =
                                anime?.mal_id ??
                                anime?.id ??
                                item.anime_id ??
                                item.id;

                            if (animeId == null) {
                                return null;
                            }

                            const id = String(animeId);

                            return (
                                <AnimeCard
                                    key={id}
                                    anime={anime}
                                    statusMap={statusMap}
                                    isFavorited={true}
                                    isFavoritePending={
                                        toggleFavorite.isPending
                                    }
                                    onToggleFavorite={() =>
                                        toggleFavorite.mutate({
                                            anime_id:
                                                animeId,
                                            title:
                                                anime?.title ||
                                                item.title ||
                                                "",
                                            image:
                                                anime?.image ||
                                                item.image ||
                                                "",
                                        })
                                    }
                                />
                            );
                        })}
                    </div>
                )}
            </PageContainer>
        </>
    );
}


export default Favorites;