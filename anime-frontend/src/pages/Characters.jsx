import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import EmptyState from "../components/ui/EmptyState";
import OptimizedImage from "../components/ui/OptimizedImage";
import PageContainer from "../components/ui/PageContainer";
import { AnimeAPI } from "../api/anime.api";

import "../components/detail/CharactersSection.css";
import "../styles/recommendations.css";

function Characters() {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("desc");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const charactersQuery = useInfiniteQuery({
        queryKey: ["general-characters", query, sort],
        queryFn: ({ pageParam }) => AnimeAPI.generalCharacters(pageParam, {
            q: query,
            order_by: "favorites",
            sort,
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.has_next ? lastPage.page + 1 : undefined,
        staleTime: 1000 * 60 * 60,
    });

    const characters = (charactersQuery.data?.pages ?? []).flatMap((page) => page.items ?? []);

    const handleSearch = (event) => {
        event.preventDefault();
        setQuery(search.trim());
    };

    return (
        <PageContainer>
            <Helmet>
                <title>Characters | Anime Tracker</title>
                <meta name="description" content="Explore anime characters from across the catalogue." />
            </Helmet>

            <div className="recommendations-header">
                <span className="recommendations-eyebrow">EXPLORE</span>
                <h1>Characters</h1>
                <p>Meet characters from anime across the catalogue.</p>
            </div>

            <div className="discovery-toolbar">
                <form className="discovery-search" onSubmit={handleSearch}>
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search characters..."
                        aria-label="Search characters"
                    />
                    <button type="submit">Search</button>
                </form>
                <div className="discovery-sort" role="group" aria-label="Character sorting">
                    <button
                        type="button"
                        className={sort === "desc" ? "active" : ""}
                        onClick={() => setSort("desc")}
                    >
                        Popular
                    </button>
                    <button
                        type="button"
                        className={sort === "asc" ? "active" : ""}
                        onClick={() => setSort("asc")}
                    >
                        Least Popular
                    </button>
                </div>
            </div>

            {charactersQuery.isLoading ? (
                <div className="characters-grid">
                    {Array.from({ length: 12 }).map((_, index) => <div className="character-skeleton" key={index} />)}
                </div>
            ) : charactersQuery.isError || characters.length === 0 ? (
                <EmptyState text="No characters found." icon="👥" />
            ) : (
                <>
                    <div className="characters-grid">
                        {characters.map((character) => (
                            <article className="character-card" key={character.id}>
                                <div className="character-image">
                                    <OptimizedImage
                                        src={character.image || "/no-image.png"}
                                        alt={character.name}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="character-info">
                                    <h3>{character.name}</h3>
                                    {character.favorites > 0 && (
                                        <span className="character-voice">♥ {character.favorites.toLocaleString()}</span>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                    {charactersQuery.hasNextPage && (
                        <div className="discovery-load-more">
                            <button
                                type="button"
                                className="discovery-load-more-button"
                                onClick={() => charactersQuery.fetchNextPage()}
                                disabled={charactersQuery.isFetchingNextPage}
                            >
                                {charactersQuery.isFetchingNextPage ? "Loading..." : "Load More"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </PageContainer>
    );
}

export default Characters;
