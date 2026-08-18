import { useMemo } from "react";

import { useLibrary } from "../hooks/useLibrary";

import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import { Helmet } from "react-helmet-async";
import PageContainer from "../components/ui/PageContainer";
import LibrarySection from "../components/library/LibrarySection";
import EmptyState from "../components/ui/EmptyState";
function Library() {

    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useLibrary();

    const grouped = useMemo(() => {
        const library =
            data?.pages?.flatMap(
                page => page.results || []
            ) || [];

        return library.reduce((acc, item) => {
            const status = (item.status || "").toLowerCase();

            if (!acc[status]) {
                acc[status] = [];
            }

            acc[status].push(item);

            return acc;
        }, {
            watching: [],
            completed: [],
            plan_to_watch: [],
            dropped: [],
        });
    }, [data]);


    // ---------------- LOADING ----------------
    if (isLoading) {

        return (
            <div style={styles.loadingGrid}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <AnimeCardSkeleton key={i} />
                ))}
            </div>
        );
    }
    
    if (error) {
        return (
            <PageContainer>

                <EmptyState
                    text="Failed to load your library."
                />

                <button
                    className="retry-btn"
                    onClick={refetch}
                >
                    Retry
                </button>

            </PageContainer>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Library | Anime Tracker</title>

                <meta
                    name="description"
                    content="Manage your anime watching list."
                />
            </Helmet>

            <PageContainer>

            <h1 style={styles.title}>
                My Library
            </h1>


            {/* GROUPS */}
            {Object.entries(grouped).map(([key, items]) => (

                <LibrarySection
                    key={key}
                    title={key.replaceAll("_", " ")}
                    items={items}
                />

            ))}
            {hasNextPage && (

                <button
                    className="load-more-btn"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                >
                    {isFetchingNextPage
                        ? "Loading..."
                        : "Load More Anime"}
                </button>

            )}
        </PageContainer>
    </>
    );
}

const styles = {
    title: {
        fontSize: "42px",
        marginBottom: "30px"
    },

    loadingGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 20
    }
};

export default Library;