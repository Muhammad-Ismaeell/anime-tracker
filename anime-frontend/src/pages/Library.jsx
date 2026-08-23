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


        return library.reduce(
            (acc, item) => {

                const status =
                    (item.status || "")
                    .toLowerCase();


                if (!acc[status]) {
                    acc[status] = [];
                }


                acc[status].push(item);


                return acc;

            },
            {
                watching: [],
                completed: [],
                plan_to_watch: [],
                dropped: [],
            }
        );

    }, [data]);


    const totalLibraryItems =
        Object.values(grouped)
            .flat()
            .length;



    // ---------------- LOADING ----------------

    if (isLoading) {

        return (
            <PageContainer>

                <div className="grid">

                    {Array.from({
                        length: 12
                    }).map((_, index) => (

                        <AnimeCardSkeleton
                            key={index}
                        />

                    ))}

                </div>

            </PageContainer>
        );

    }



    // ---------------- ERROR ----------------

    if (error) {

        return (
            <PageContainer>

                <EmptyState
                    text="Failed to load your library."
                    icon="⚠️"
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

                <title>
                    My Library | Anime Tracker
                </title>


                <meta
                    name="description"
                    content="Manage your anime watching list."
                />

            </Helmet>



            <PageContainer>


                <h1 style={styles.title}>
                    My Library
                </h1>



                {/* EMPTY STATE */}

                {totalLibraryItems === 0 ? (

                    <EmptyState
                        text="Your library is empty. Start adding anime to track your progress."
                        icon="📚"
                    />

                ) : (


                    Object.entries(grouped)
                        .map(([key, items]) => (

                            items.length > 0 && (

                                <LibrarySection

                                    key={key}

                                    title={
                                        key.replaceAll(
                                            "_",
                                            " "
                                        )
                                    }

                                    items={items}

                                />

                            )

                        ))

                )}



                {/* LOAD MORE */}

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
    }

};


export default Library;