import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useAnimeSearch } from "../hooks/useAnimeSearch";
import { useDebouncedSearch } from "../hooks/useDebouncedSearch";
import { AnimeSkeleton } from "../components/skeletons/AnimeSkeleton";
import AnimeCard from "../components/AnimeCard";
import { normalizeAnime } from "../utils/normalizeAnime";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import EmptyState from "../components/ui/EmptyState";

export default function Search() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const [params, setParams] = useSearchParams();
    const {statusMap} = useGlobalLibrary();
    const [query, setQuery] = useState(params.get("q") || "");
    const debouncedQuery = useDebouncedSearch(query, 700);

    const [filters, setFilters] = useState({
        type: params.get("type") || "",
        season: params.get("season") || "",
        year: params.get("year") || ""
    });

    const loadMoreRef = useRef(null);

    const normalizedFilters = useMemo(() => ({
        type: filters.type || undefined,
        season: filters.season || undefined,
        year: filters.year ? Number(filters.year) : undefined
    }), [filters]);
    
    const hasFilters = Object.values(normalizedFilters)
        .some(v => v !== undefined && v !== "");

    const isSearching =
        !!debouncedQuery.trim() || hasFilters;

    

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useAnimeSearch(debouncedQuery, normalizedFilters);

    // ✅ FIXED FLATTEN
    const results = useMemo(() => {
        return (data?.pages || [])
            .flatMap(page => page?.items || []);
    }, [data]);

    useEffect(() => {

        const t = setTimeout(() => {

            const p = {};

            if (query) p.q = query;
            if (filters.type) p.type = filters.type;
            if (filters.season) p.season = filters.season;
            if (filters.year) p.year = filters.year;

            setParams(p);

        }, 300);

        return () => clearTimeout(t);

    }, [query, filters, setParams]);

    useEffect(() => {

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        });

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();

    }, [fetchNextPage, hasNextPage]);

    return (
        <>
            <Helmet>
                <title>Advanced Search | Anime Tracker</title>

                <meta
                    name="description"
                    content="Search anime by filters such as year, season, score and type."
                />
            </Helmet>

            <div className="page">

            <h1>
                {isSearching
                    ? "🔎 Search Results"
                    : "🔥 Discover Anime"}
            </h1>

            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime..."
            />

            {isLoading ? (
                <div className="grid">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <AnimeSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid">

                        {results.map(anime => (
                            <AnimeCard
                                key={anime.id ?? anime.mal_id}
                                anime={anime}
                                statusMap={statusMap}
                            />
                        ))}

                    </div>

                    <div ref={loadMoreRef} style={{ height: 40 }} />

                    {isFetchingNextPage && (
                        <p>Loading more...</p>
                    )}
                </>
            )}
        </div>
    </>
    );
}