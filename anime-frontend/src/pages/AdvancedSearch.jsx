import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { useAnimeSearch } from "../hooks/useAnimeSearch";
import { useDebouncedSearch } from "../hooks/useDebouncedSearch";
import {
    useFavorites,
    useToggleFavorite,
} from "../hooks/user/useFavorites";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";


export default function AdvancedSearch() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [params, setParams] = useSearchParams();

    const { statusMap } = useGlobalLibrary();

    const [query, setQuery] = useState(
        params.get("q") || ""
    );

    const [filters, setFilters] = useState({
        year: params.get("year") || "",
        season: params.get("season") || "",
        type: params.get("type") || "",
        status: params.get("status") || "",
        min_score: params.get("min_score") || "",
        order_by: params.get("order_by") || "",
        sort: params.get("sort") || "",
    });

    const loadMoreRef = useRef(null);

    const debouncedQuery = useDebouncedSearch(query, 400);

    const normalizedFilters = useMemo(
        () => ({
            type: filters.type || undefined,
            season: filters.season || undefined,
            year: filters.year || undefined,
            status: filters.status || undefined,
            min_score: filters.min_score || undefined,
            order_by: filters.order_by || undefined,
            sort: filters.sort || undefined,
        }),
        [filters]
    );

    const hasFilters = Object.values(normalizedFilters).some(
        (value) => value !== undefined && value !== ""
    );

    const isSearching =
        Boolean(debouncedQuery.trim()) || hasFilters;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
        refetch,
    } = useAnimeSearch(
        debouncedQuery,
        normalizedFilters
    );

    const {
        data: favoritesRes,
    } = useFavorites();

    const toggleFavorite = useToggleFavorite();

    const { favoriteIds } = useMemo(() => {
        const ids = new Set(
            (favoritesRes?.results ?? [])
                .map((favorite) => {
                    const id =
                        favorite.anime?.mal_id ??
                        favorite.anime?.id ??
                        favorite.anime_id ??
                        favorite.mal_id;

                    return id != null
                        ? String(id)
                        : null;
                })
                .filter(Boolean)
        );

        return {
            favoriteIds: ids,
        };
    }, [favoritesRes]);

    const results = useMemo(() => {
        return (data?.pages ?? [])
            .flatMap(
                (page) => page?.items ?? []
            );
    }, [data]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const nextParams = {};

            if (query.trim()) {
                nextParams.q = query.trim();
            }

            Object.entries(filters).forEach(
                ([key, value]) => {
                    if (value) {
                        nextParams[key] = value;
                    }
                }
            );

            setParams(nextParams);
        }, 300);

        return () => clearTimeout(timeout);
    }, [query, filters, setParams]);

    useEffect(() => {
        const observer = new IntersectionObserver(
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

        return () => observer.disconnect();
    }, [
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    ]);

    return (
        <>
            <Helmet>
                <title>
                    Advanced Search | Anime Tracker
                </title>

                <meta
                    name="description"
                    content="Search anime by year, season, type, status and score."
                />
            </Helmet>

            <div className="page">
                <div className="section-header">
                    <h1>
                        {isSearching
                            ? "🔎 Search Results"
                            : "🔥 Discover Anime"}
                    </h1>
                </div>

                <input
                    className="search-input"
                    value={query}
                    onChange={(e) =>
                        setQuery(e.target.value)
                    }
                    placeholder="Search anime..."
                />

                <div className="advanced-filters">
                    <input
                        className="filter-input"
                        type="number"
                        placeholder="Year"
                        value={filters.year}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                year: e.target.value,
                            }))
                        }
                    />

                    <select
                        className="filter-input"
                        disabled={!filters.year}
                        value={filters.season}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                season: e.target.value,
                            }))
                        }
                    >
                        <option value="">
                            Any Season
                        </option>
                        <option value="winter">
                            Winter
                        </option>
                        <option value="spring">
                            Spring
                        </option>
                        <option value="summer">
                            Summer
                        </option>
                        <option value="fall">
                            Fall
                        </option>
                    </select>

                    <select
                        className="filter-input"
                        value={filters.type}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                type: e.target.value,
                            }))
                        }
                    >
                        <option value="">
                            Any Type
                        </option>
                        <option value="tv">TV</option>
                        <option value="movie">
                            Movie
                        </option>
                        <option value="ova">OVA</option>
                        <option value="ona">ONA</option>
                        <option value="special">
                            Special
                        </option>
                    </select>

                    <select
                        className="filter-input"
                        value={filters.status}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                status: e.target.value,
                            }))
                        }
                    >
                        <option value="">
                            Any Status
                        </option>
                        <option value="airing">
                            Airing
                        </option>
                        <option value="complete">
                            Completed
                        </option>
                        <option value="upcoming">
                            Upcoming
                        </option>
                    </select>

                    <input
                        className="filter-input"
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        placeholder="Min Score"
                        value={filters.min_score}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                min_score:
                                    e.target.value,
                            }))
                        }
                    />
                </div>

                {isLoading && results.length === 0 ? (
                    <div className="grid">
                        {Array.from({
                            length: 12,
                        }).map((_, index) => (
                            <AnimeCardSkeleton
                                key={index}
                            />
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
                            type="button"
                            onClick={refetch}
                            className="retry-btn"
                        >
                            Retry
                        </button>
                    </div>
                ) : results.length === 0 ? (
                    <EmptyState
                        text={
                            isSearching
                                ? "No anime found matching your filters."
                                : "Start searching to discover anime."
                        }
                    />
                ) : (
                    <div className="grid">
                        {results.map((anime) => {
                            const animeId =
                                anime.id ??
                                anime.mal_id;

                            const id = String(animeId);

                            return (
                                <AnimeCard
                                    key={id}
                                    anime={anime}
                                    statusMap={statusMap}
                                    isFavorited={favoriteIds.has(
                                        id
                                    )}
                                    isFavoritePending={
                                        toggleFavorite.isPending
                                    }
                                    onToggleFavorite={() =>
                                        toggleFavorite.mutate({
                                            anime_id:
                                                animeId,
                                            title:
                                                anime.title,
                                            image:
                                                anime.image ||
                                                "",
                                        })
                                    }
                                />
                            );
                        })}
                    </div>
                )}

                <div
                    ref={loadMoreRef}
                    style={{ height: 40 }}
                />

                {isFetchingNextPage && (
                    <div className="empty-state">
                        Loading more anime...
                    </div>
                )}
            </div>
        </>
    );
}