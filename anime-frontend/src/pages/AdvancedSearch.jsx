import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useAnimeSearch } from "../hooks/useAnimeSearch";
import { useDebouncedSearch } from "../hooks/useDebouncedSearch";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";
import { Helmet } from "react-helmet-async";

export default function AdvancedSearch() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const [params, setParams] = useSearchParams();
    const {statusMap} = useGlobalLibrary();
    const [query, setQuery] = useState(params.get("q") || "");

    const [filters, setFilters] = useState({
        q: "",
        year: "",
        season: "",
        type: "",
        status: "",
        min_score: "",
        order_by: "",
        sort: "",
    });

    const loadMoreRef = useRef(null);

    const debouncedQuery = useDebouncedSearch(query, 400);

    

    const normalizedFilters = useMemo(() => ({
        type: filters.type || undefined,
        season: filters.season || undefined,
        year: filters.year || undefined,
        status: filters.status || undefined,
        rating: filters.rating || undefined,
        genres: filters.genres || undefined,
        order_by: filters.order_by || undefined,
        sort: filters.sort || undefined,
        min_score: filters.min_score || undefined,
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
        isLoading,
        isError,
        error,
        refetch
    } = useAnimeSearch(
        debouncedQuery,
        normalizedFilters
    );

    // flatten results safely
    const results = useMemo(() => {
        return (data?.pages || [])
            .flatMap(page => page?.items || []);
    }, [data]);

    // sync URL
    useEffect(() => {

        const t = setTimeout(() => {
            const p = {};

            if (query) p.q = query;
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    p[key] = value;
                }
            });

            setParams(p);
        }, 300);

        return () => clearTimeout(t);

    }, [query, filters, setParams]);

    // infinite scroll
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
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime..."
            />
            <div className="advanced-filters">

                <input
                    className="filter-input"
                    type="number"
                    placeholder="Year"
                    value={filters.year}
                    onChange={(e) =>
                        setFilters(prev => ({
                            ...prev,
                            year: e.target.value
                        }))
                    }
                />

                <select
                    className="filter-input"
                    disabled={!filters.year}
                    value={filters.season}
                    onChange={(e) =>
                        setFilters(prev => ({
                            ...prev,
                            season: e.target.value
                        }))
                    }
                >
                    <option value="">Any Season</option>
                    <option value="winter">Winter</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                </select>

                <select
                    className="filter-input"
                    value={filters.type}
                    onChange={(e) =>
                        setFilters(prev => ({
                            ...prev,
                            type: e.target.value
                        }))
                    }
                >
                    <option value="">Any Type</option>
                    <option value="tv">TV</option>
                    <option value="movie">Movie</option>
                    <option value="ova">OVA</option>
                    <option value="ona">ONA</option>
                    <option value="special">Special</option>
                </select>

                <select
                    className="filter-input"
                    value={filters.status}
                    onChange={(e) =>
                        setFilters(prev => ({
                            ...prev,
                            status: e.target.value
                        }))
                    }
                >
                    <option value="">Any Status</option>
                    <option value="airing">Airing</option>
                    <option value="complete">Completed</option>
                    <option value="upcoming">Upcoming</option>
                </select>

                <input
                    className="filter-input"
                    type="number"
                    min="0"
                    max="10"
                    placeholder="Min Score"
                    value={filters.min_score}
                    onChange={(e) =>
                        setFilters(prev => ({
                            ...prev,
                            min_score: e.target.value
                        }))
                    }
                />

            </div>

            {isLoading && results.length === 0 ? (

                <div className="grid">

                    {Array.from({ length: 12 }).map((_, i)=>(
                        <AnimeCardSkeleton key={i}/>
                    ))}

                </div>


            ) : isError ? (

                <div className="error-state">

                    <h2>
                        😢 Something went wrong
                    </h2>

                    <p>
                        {error?.message ||
                        "Failed to load anime."}
                    </p>


                    <button
                        onClick={() => refetch()}
                        className="retry-btn"
                    >
                        Retry
                    </button>

                </div>


            ) : (
                <>
                    {results.length === 0 ? (

                    <EmptyState text="No anime found matching your filters" />

                ) : (

                    <div className="grid">

                        {results.map((anime, i) => (
                            <AnimeCard
                                key={anime.id ?? i}
                                anime={anime}
                                statusMap={statusMap}
                            />
                        ))}

                    </div>

                )}

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