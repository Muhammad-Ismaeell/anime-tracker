import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import EmptyState from "../components/ui/EmptyState";
import OptimizedImage from "../components/ui/OptimizedImage";
import PageContainer from "../components/ui/PageContainer";
import { AnimeAPI } from "../api/anime.api";

import "../components/detail/CharactersSection.css";
import "../styles/infinite-scroll.css";
import "../styles/recommendations.css";

function Characters() {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const loadMoreRef = useRef(null);
    const canLoadMoreRef = useRef(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const charactersQuery = useInfiniteQuery({
        queryKey: ["general-characters", query],
        queryFn: ({ pageParam }) => AnimeAPI.generalCharacters(pageParam, {
            q: query,
            order_by: "favorites",
            sort: "desc",
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.has_next ? lastPage.page + 1 : undefined,
        staleTime: 1000 * 60 * 60,
    });

    const characters = (charactersQuery.data?.pages ?? []).flatMap((page) => page.items ?? []);

    useEffect(() => {
        canLoadMoreRef.current = !charactersQuery.isFetchingNextPage;
    }, [query, charactersQuery.isFetchingNextPage]);

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return;

                if (
                    canLoadMoreRef.current &&
                    charactersQuery.hasNextPage &&
                    !charactersQuery.isFetchingNextPage
                ) {
                    canLoadMoreRef.current = false;
                    charactersQuery.fetchNextPage();
                }
            },
            { rootMargin: "600px 0px" }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [charactersQuery.fetchNextPage, charactersQuery.hasNextPage, charactersQuery.isFetchingNextPage]);

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
                    <button type="button" className="active">
                        Popular
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
                        <div ref={loadMoreRef} className="infinite-scroll-sentinel">
                            {charactersQuery.isFetchingNextPage && (
                                <div className="characters-grid infinite-scroll-skeleton-grid">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div className="character-skeleton" key={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </PageContainer>
    );
}

export default Characters;
