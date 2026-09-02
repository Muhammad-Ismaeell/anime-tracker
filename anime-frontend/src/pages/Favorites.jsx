
import { Helmet } from "react-helmet-async";

import PageContainer from "../components/ui/PageContainer";
import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";
import {
    useEffect,
    useRef,
} from "react";
import {
    useFavorites,
    useToggleFavorite,
} from "../hooks/user/useFavorites";

import { useGlobalLibrary } from "../hooks/useGlobalLibrary";


function Favorites() {
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error,
        refetch,
    } = useFavorites();

    const loadMoreRef = useRef(null);

    const toggleFavorite = useToggleFavorite();

    const { statusMap } = useGlobalLibrary();
    
    useEffect(() => {
        const observer =
            new IntersectionObserver(
                (entries) => {
                    if (
                        entries[0]?.isIntersecting &&
                        hasNextPage &&
                        !isFetchingNextPage
                    ) {
                        fetchNextPage();
                    }
                },
                {
                    rootMargin: "300px",
                }
            );

        if (loadMoreRef.current) {
            observer.observe(
                loadMoreRef.current
            );
        }

        return () => {
            observer.disconnect();
        };
    }, [
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    ]);

    /*
     * Combine all loaded pages into one list.
     */
    const favorites =
        data?.pages?.flatMap(
            (page) => page.results || []
        ) ?? [];


    /*
     * Total number of favorites reported
     * by the backend.
     */
    const totalFavorites =
        data?.pages?.[0]?.count ?? 0;


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

                    {totalFavorites > 0 && (
                        <span className="section-count">
                            {totalFavorites}
                        </span>
                    )}
                </div>


                {favorites.length === 0 ? (
                    <EmptyState
                        text="You haven't added any favorite anime yet."
                        icon="❤️"
                    />
                ) : (
                    <>
                        <div className="grid">
                            {favorites.map((item) => {

                                const anime =
                                    item.anime;

                                const animeId =
                                    anime?.mal_id ??
                                    anime?.id ??
                                    item.anime_id ??
                                    item.id;

                                if (animeId == null) {
                                    return null;
                                }

                                const id =
                                    String(animeId);


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

                        <div
                            ref={loadMoreRef}
                            className="search-load-more"
                            aria-hidden="true"
                        />

                        {isFetchingNextPage && (
                            <div className="search-loading-more">
                                Loading more favorites...
                            </div>
                        )}
                    </>
                )}

            </PageContainer>
        </>
    );
}


export default Favorites;
