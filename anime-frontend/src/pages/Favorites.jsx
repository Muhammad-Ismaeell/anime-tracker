import PageContainer from "../components/ui/PageContainer";
import AnimeCard from "../components/AnimeCard";

import { useFavorites } from "../hooks/user/useFavorites";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import EmptyState from "../components/ui/EmptyState";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import { Helmet } from "react-helmet-async";

function Favorites(){


    const {
        data,
        isLoading,
        error,
        refetch
    } = useFavorites();


    const {
        statusMap
    } = useGlobalLibrary();



    const favorites =
        data?.results ?? [];



    if(isLoading){

        return (

            <PageContainer>

                <div className="grid">

                    {
                        Array.from({
                            length:12
                        })
                        .map((_,i)=>(

                            <AnimeCardSkeleton
                                key={i}
                            />

                        ))
                    }

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
                <title>My Favorites | Anime Tracker</title>

                <meta
                    name="description"
                    content="View your favorite anime."
                />
            </Helmet>

            <PageContainer>

            {
                favorites.length ?

                (

                    <div className="grid">

                    {
                        favorites.map(item=>(


                            <AnimeCard

                                key={item.id}

                                anime={item.anime}

                                statusMap={statusMap}

                            />


                        ))
                    }


                    </div>

                )

                :

                (

                    <EmptyState
                        text="No favorite anime yet"
                    />

                )

            }


        </PageContainer>
    </>

    );

}


export default Favorites;