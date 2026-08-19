import { Helmet } from "react-helmet-async";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";

import PageContainer from "../components/ui/PageContainer";
import AnimeSection from "../components/ui/AnimeSection";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";

import { useToggleFavorite, useFavorites } 
from "../hooks/user/useFavorites";

import { useGlobalLibrary } 
from "../hooks/useGlobalLibrary";

import { normalizeAnime } 
from "../utils/normalizeAnime";


function Home(){


    const trendingQuery =
        useInfiniteAnime("trending");

    const seasonalQuery =
        useInfiniteAnime("seasonal");

    const topQuery =
        useInfiniteAnime("top");


    const toggleFavorite =
        useToggleFavorite();


    const {statusMap} =
        useGlobalLibrary();


    const {data:favoritesRes} =
        useFavorites();



    const favoriteIds = new Set(
        (favoritesRes?.results ?? [])
            .map((favorite) => {
                const id =
                    favorite.anime?.mal_id ??
                    favorite.anime?.id ??
                    favorite.anime_id ??
                    favorite.mal_id;

                return id != null ? String(id) : null;
            })
            .filter(Boolean)
    );



    const extractAnime = (query)=>{


        const pages =
            query.data?.pages ?? [];


        const map = new Map();



        pages.forEach(page=>{


            const items =
                page.items ??
                page.data ??
                [];



            items.forEach(item=>{


                const anime =
                    normalizeAnime(item);


                if(anime?.id){

                    map.set(
                        String(anime.id),
                        anime
                    );

                }

            });


        });



        return Array.from(
            map.values()
        );

    };




    const loading =
        trendingQuery.isLoading ||
        seasonalQuery.isLoading ||
        topQuery.isLoading;



    const error =
        trendingQuery.error ||
        seasonalQuery.error ||
        topQuery.error;



    if(error){

        return (

            <PageContainer>

                <EmptyState
                    text="Failed to load anime."
                />

            </PageContainer>

        );

    }



    return (

<PageContainer>


<Helmet>

<title>
Anime Tracker
</title>


<meta
name="description"
content="Discover trending and seasonal anime."
/>

</Helmet>



<section className="home-hero">


<h1>
Discover Your Next Anime
</h1>


<p>
Track, save and explore your favorite shows.
</p>


</section>




{
loading ?

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


:

<>


<AnimeSection
    title="Trending Anime"
    emoji="🔥"
    animeList={extractAnime(trendingQuery)}
    statusMap={statusMap}
    favoriteIds={favoriteIds}
    toggleFavorite={toggleFavorite}
    viewAllPath="/trending"
/>



<AnimeSection
    title="Current Season"
    emoji="🌸"
    animeList={extractAnime(seasonalQuery)}
    statusMap={statusMap}
    favoriteIds={favoriteIds}
    toggleFavorite={toggleFavorite}
    viewAllPath="/seasonal"
/>



<AnimeSection
    title="Top Rated Anime"
    emoji="⭐"
    animeList={extractAnime(topQuery)}
    statusMap={statusMap}
    favoriteIds={favoriteIds}
    toggleFavorite={toggleFavorite}
    viewAllPath="/top"
/>


</>

}


</PageContainer>

    );

}


export default Home;