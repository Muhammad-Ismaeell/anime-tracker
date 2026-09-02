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

import { useFavoriteIds } from "../hooks/user/useFavoriteIds";


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

    const favoriteIds = useFavoriteIds();

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
            observer.observe(loadMoreRef.current);
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
     * useFavorites() is an infinite query,
     * so all favorites are stored inside pages.
     */
    const favorites =
        data?.pages?.flatMap(
            (page) => page?.results ?? []
        ) ?? [];


    /*
     * The backend count is included
     * in the first page.
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
                    {Array.from({
                        length: 12,
                    }).map((_, index) => (
                        <AnimeCardSkeleton
                            key={index}
                        />
                    ))}
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

                                /*
                                 * The favorite endpoint returns
                                 * the anime inside item.anime.
                                 */
                                const anime =
                                    item?.anime;

                                if (!anime) {
                                    return null;
                                }


                                const animeId =
                                    anime?.mal_id ??
                                    anime?.id ??
                                    item?.anime_id;

                                if (animeId == null) {
                                    return null;
                                }


                                const normalizedId =
                                    String(animeId);


                                /*
                                 * Prefer the shared favorite ID
                                 * state so this page stays in sync
                                 * with Home/Search/etc.
                                 */
                                const isFavorited =
                                    favoriteIds.has(
                                        normalizedId
                                    );


                                return (
                                    <AnimeCard
                                        key={normalizedId}
                                        anime={anime}
                                        isFavorited={
                                            isFavorited
                                        }
                                        isFavoritePending={
                                            toggleFavorite.isPending
                                        }
                                        onToggleFavorite={() =>
                                            toggleFavorite.mutate({
                                                anime_id:
                                                    animeId,

                                                title:
                                                    anime?.title ??
                                                    item?.title ??
                                                    "",

                                                image:
                                                    anime?.image ??
                                                    item?.image ??
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
