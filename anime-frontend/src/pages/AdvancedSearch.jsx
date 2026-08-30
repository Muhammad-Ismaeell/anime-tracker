
import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useSearchParams,
} from "react-router-dom";

import {
    Helmet,
} from "react-helmet-async";

import {
    useAnimeSearch,
} from "../hooks/useAnimeSearch";

import {
    useDebouncedSearch,
} from "../hooks/useDebouncedSearch";

import {
    useFavorites,
    useToggleFavorite,
} from "../hooks/user/useFavorites";

import {
    useGlobalLibrary,
} from "../hooks/useGlobalLibrary";

import AnimeCard from "../components/AnimeCard";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import EmptyState from "../components/ui/EmptyState";





const INITIAL_FILTERS = {
    year: "",
    season: "",
    type: "",
    status: "",
    genres: "",
    min_score: "",
    order_by: "",
    sort: "",
};


export default function AdvancedSearch() {

    // ============================================================
    // INITIALIZATION
    // ============================================================

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    const [
        params,
        setParams,
    ] = useSearchParams();


    const {
        statusMap,
    } = useGlobalLibrary();


    // ============================================================
    // SEARCH QUERY
    // ============================================================

    const [
        query,
        setQuery,
    ] = useState(
        params.get("q") || ""
    );


    // ============================================================
    // FILTERS
    // ============================================================

    const [
        filters,
        setFilters,
    ] = useState(() => ({
        ...INITIAL_FILTERS,

        year:
            params.get("year") || "",

        season:
            params.get("season") || "",

        type:
            params.get("type") || "",

        status:
            params.get("status") || "",

        genres:
            params.get("genres") || "",

        min_score:
            params.get("min_score") || "",

        order_by:
            params.get("order_by") || "",

        sort:
            params.get("sort") || "",
    }));


    const loadMoreRef =
        useRef(null);


    // ============================================================
    // DEBOUNCED SEARCH
    // ============================================================

    const debouncedQuery =
        useDebouncedSearch(
            query,
            400
        );


    // ============================================================
    // NORMALIZED FILTERS
    // ============================================================

    const normalizedFilters =
        useMemo(
            () => ({
                type:
                    filters.type ||
                    undefined,

                season:
                    filters.season ||
                    undefined,

                year:
                    filters.year ||
                    undefined,

                status:
                    filters.status ||
                    undefined,

                genres:
                    filters.genres ||
                    undefined,

                min_score:
                    filters.min_score ||
                    undefined,

                order_by:
                    filters.order_by ||
                    undefined,

                sort:
                    filters.sort ||
                    undefined,
            }),
            [filters]
        );


    const hasFilters =
        Object.values(
            normalizedFilters
        ).some(
            (value) =>
                value !== undefined &&
                value !== ""
        );


    const isSearching =
        Boolean(
            debouncedQuery.trim()
        ) ||
        hasFilters;


    // ============================================================
    // SEARCH
    // ============================================================

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


    // ============================================================
    // FAVORITES
    // ============================================================

    const {
        data: favoritesRes,
    } = useFavorites();


    const toggleFavorite =
        useToggleFavorite();


    const favoriteIds =
        useMemo(() => {

            return new Set(
                (
                    favoritesRes?.results ??
                    []
                )
                    .map(
                        (favorite) => {

                            const id =
                                favorite.anime?.mal_id ??
                                favorite.anime?.id ??
                                favorite.anime_id ??
                                favorite.mal_id;

                            return id != null
                                ? String(id)
                                : null;
                        }
                    )
                    .filter(Boolean)
            );

        }, [
            favoritesRes,
        ]);


    // ============================================================
    // RESULTS
    // ============================================================

    const results =
        useMemo(
            () =>
                (
                    data?.pages ??
                    []
                ).flatMap(
                    (page) =>
                        page?.items ??
                        []
                ),
            [data]
        );


    const totalResults =
        data?.pages?.[0]?.total ??
        0;


    // ============================================================
    // URL SYNCHRONIZATION
    // ============================================================

    useEffect(() => {

        const timeout =
            setTimeout(() => {

                const nextParams = {};


                if (query.trim()) {
                    nextParams.q =
                        query.trim();
                }


                Object.entries(
                    filters
                ).forEach(
                    ([key, value]) => {

                        if (value) {
                            nextParams[key] =
                                value;
                        }

                    }
                );


                setParams(
                    nextParams,
                    {
                        replace: true,
                    }
                );

            }, 300);


        return () =>
            clearTimeout(timeout);

    }, [
        query,
        filters,
        setParams,
    ]);




    // ============================================================
    // INFINITE SCROLL
    // ============================================================

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
                    rootMargin:
                        "300px",
                }
            );


        if (
            loadMoreRef.current
        ) {

            observer.observe(
                loadMoreRef.current
            );

        }


        return () =>
            observer.disconnect();

    }, [
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    ]);


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <>

            <Helmet>

                <title>
                    Search Anime | Anime Tracker
                </title>

                <meta
                    name="description"
                    content="Search and discover anime by title, genre, year, season, type, status and score."
                />

            </Helmet>


            <main className="search-page">

                {/* ==================================================
                    SEARCH HERO
                ================================================== */}

                <section className="search-hero">

                    <div className="search-hero-content">

                        <span className="search-hero-eyebrow">
                            DISCOVER
                        </span>


                        <h1 className="search-hero-title">
                            Find your next anime
                        </h1>


                        <p className="search-hero-description">
                            Search through thousands of anime
                            and find something worth watching.
                        </p>

                    </div>


                    {/* SEARCH INPUT */}

                    <div className="search-box">

                        <span
                            className="search-box-icon"
                            aria-hidden="true"
                        >
                            🔎
                        </span>


                        <input
                            className="search-input"
                            value={query}
                            onChange={(event) =>
                                setQuery(
                                    event.target.value
                                )
                            }
                            placeholder="Search anime..."
                            aria-label="Search anime"
                        />


                        {query && (

                            <button
                                type="button"
                                className="search-box-clear"
                                onClick={() =>
                                    setQuery("")
                                }
                                aria-label="Clear search"
                            >
                                ×
                            </button>

                        )}

                    </div>

                </section>


                {/* ==================================================
                    FILTER PANEL
                ================================================== */}

                <section className="search-filters">

                    <div className="search-filters-header">

                        <div className="search-filters-heading">

                            <span className="search-filters-eyebrow">
                                FILTERS
                            </span>

                            <h2 className="search-filters-title">
                                Narrow your search
                            </h2>

                        </div>


                        {hasFilters && (
                            <button
                                type="button"
                                className="search-filters-clear"
                                onClick={() => {
                                    setFilters({
                                        year: "",
                                        season: "",
                                        type: "",
                                        status: "",
                                        genres: "",
                                        min_score: "",
                                        order_by: "",
                                        sort: "",
                                    });
                                }}
                            >
                                Clear all
                            </button>
                        )}

                    </div>


                    <div className="advanced-filters">

                        {/* YEAR */}

                        <div className="search-filter-field">

                            <label htmlFor="search-year">
                                Year
                            </label>

                            <input
                                id="search-year"
                                className="filter-input"
                                type="number"
                                placeholder="Any year"
                                value={filters.year}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        year: e.target.value,
                                        season: e.target.value
                                            ? prev.season
                                            : "",
                                    }))
                                }
                            />

                        </div>


                        {/* SEASON */}

                        <div className="search-filter-field">

                            <label htmlFor="search-season">
                                Season
                            </label>

                            <select
                                id="search-season"
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
                                    Any season
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

                        </div>


                        {/* TYPE */}

                        <div className="search-filter-field">

                            <label htmlFor="search-type">
                                Type
                            </label>

                            <select
                                id="search-type"
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
                                    Any type
                                </option>

                                <option value="tv">
                                    TV
                                </option>

                                <option value="movie">
                                    Movie
                                </option>

                                <option value="ova">
                                    OVA
                                </option>

                                <option value="ona">
                                    ONA
                                </option>

                                <option value="special">
                                    Special
                                </option>

                            </select>

                        </div>


                        {/* STATUS */}

                        <div className="search-filter-field">

                            <label htmlFor="search-status">
                                Status
                            </label>

                            <select
                                id="search-status"
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
                                    Any status
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

                        </div>


                        {/* GENRE */}

                        <div className="search-filter-field">

                            <label htmlFor="search-genre">
                                Genre
                            </label>

                            <select
                                id="search-genre"
                                className="filter-input"
                                value={filters.genres}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        genres: e.target.value,
                                    }))
                                }
                            >

                                <option value="">
                                    Any genre
                                </option>

                                <option value="Action">
                                    Action
                                </option>

                                <option value="Adventure">
                                    Adventure
                                </option>

                                <option value="Comedy">
                                    Comedy
                                </option>

                                <option value="Drama">
                                    Drama
                                </option>

                                <option value="Fantasy">
                                    Fantasy
                                </option>

                                <option value="Horror">
                                    Horror
                                </option>

                                <option value="Mystery">
                                    Mystery
                                </option>

                                <option value="Romance">
                                    Romance
                                </option>

                                <option value="Sci-Fi">
                                    Sci-Fi
                                </option>

                                <option value="Sports">
                                    Sports
                                </option>

                                <option value="Supernatural">
                                    Supernatural
                                </option>

                            </select>

                        </div>


                        {/* SCORE */}

                        <div className="search-filter-field">

                            <label htmlFor="search-score">
                                Minimum score
                            </label>

                            <input
                                id="search-score"
                                className="filter-input"
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="0 - 10"
                                value={filters.min_score}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        min_score: e.target.value,
                                    }))
                                }
                            />

                        </div>

                    </div>


                    {/* ACTIVE FILTERS */}

                    {hasFilters && (
                        <div className="active-search-filters">

                            <span className="active-filters-label">
                                Active:
                            </span>

                            {filters.genres && (
                                <button
                                    type="button"
                                    className="active-filter"
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            genres: "",
                                        }))
                                    }
                                >
                                    Genre: {filters.genres}
                                    <span aria-hidden="true">
                                        ×
                                    </span>
                                </button>
                            )}

                            {filters.year && (
                                <button
                                    type="button"
                                    className="active-filter"
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            year: "",
                                            season: "",
                                        }))
                                    }
                                >
                                    Year: {filters.year}
                                    <span aria-hidden="true">
                                        ×
                                    </span>
                                </button>
                            )}

                            {filters.season && (
                                <button
                                    type="button"
                                    className="active-filter"
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            season: "",
                                        }))
                                    }
                                >
                                    Season: {filters.season}
                                    <span aria-hidden="true">
                                        ×
                                    </span>
                                </button>
                            )}

                            {filters.type && (
                                <button
                                    type="button"
                                    className="active-filter"
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            type: "",
                                        }))
                                    }
                                >
                                    Type: {filters.type}
                                    <span aria-hidden="true">
                                        ×
                                    </span>
                                </button>
                            )}

                            {filters.status && (
                                <button
                                    type="button"
                                    className="active-filter"
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            status: "",
                                        }))
                                    }
                                >
                                    Status: {filters.status}
                                    <span aria-hidden="true">
                                        ×
                                    </span>
                                </button>
                            )}

                            {filters.min_score && (
                                <button
                                    type="button"
                                    className="active-filter"
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            min_score: "",
                                        }))
                                    }
                                >
                                    Score: {filters.min_score}+
                                    <span aria-hidden="true">
                                        ×
                                    </span>
                                </button>
                            )}

                        </div>
                    )}

                </section>


                {/* ==================================================
                    RESULTS HEADER
                ================================================== */}

                <section className="search-results-section">

                    <div className="search-results-header">

                        <div>

                            <span className="search-results-eyebrow">
                                {isSearching
                                    ? "RESULTS"
                                    : "BROWSE"}
                            </span>


                            <h2 className="search-results-title">
                                {isSearching
                                    ? "Search Results"
                                    : "Discover Anime"}
                            </h2>

                        </div>


                        {isSearching &&
                        !isLoading &&
                        results.length > 0 && (

                            <span className="search-results-count">
                                {totalResults.toLocaleString()}{" "}
                                anime found
                            </span>

                        )}

                    </div>


                    {/* ==================================================
                        LOADING
                    ================================================== */}

                    {isLoading &&
                    results.length === 0 ? (

                        <div className="grid">

                            {Array.from({
                                length: 12,
                            }).map(
                                (_, index) => (

                                    <AnimeCardSkeleton
                                        key={index}
                                    />

                                )
                            )}

                        </div>

                    ) : isError ? (

                        /* ==================================================
                            ERROR
                        ================================================== */

                        <div className="search-error-state">

                            <div className="search-error-icon">
                                😢
                            </div>

                            <h2>
                                Something went wrong
                            </h2>

                            <p>
                                {
                                    error?.message ||
                                    "Failed to load anime."
                                }
                            </p>

                            <button
                                type="button"
                                onClick={refetch}
                                className="retry-btn"
                            >
                                Try again
                            </button>

                        </div>

                    ) : results.length === 0 ? (

                        /* ==================================================
                            EMPTY
                        ================================================== */

                        <div className="search-empty-state">

                            <EmptyState
                                text={
                                    isSearching
                                        ? "No anime found matching your search."
                                        : "Start searching to discover anime."
                                }
                            />

                        </div>

                    ) : (

                        /* ==================================================
                            RESULTS GRID
                        ================================================== */

                        <div className="grid">

                            {results.map(
                                (anime) => {

                                    const animeId =
                                        anime.id ??
                                        anime.mal_id;

                                    if (
                                        animeId == null
                                    ) {
                                        return null;
                                    }


                                    const id =
                                        String(
                                            animeId
                                        );


                                    return (

                                        <AnimeCard
                                            key={id}
                                            anime={anime}
                                            statusMap={
                                                statusMap
                                            }
                                            isFavorited={
                                                favoriteIds.has(
                                                    id
                                                )
                                            }
                                            isFavoritePending={
                                                toggleFavorite.isPending
                                            }
                                            onToggleFavorite={() =>
                                                toggleFavorite.mutate(
                                                    {
                                                        anime_id:
                                                            animeId,

                                                        title:
                                                            anime.title,

                                                        image:
                                                            anime.image ||
                                                            "",
                                                    }
                                                )
                                            }
                                        />

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    INFINITE SCROLL
                ================================================== */}

                <div
                    ref={loadMoreRef}
                    className="search-load-more"
                    aria-hidden="true"
                />


                {isFetchingNextPage && (

                    <div className="search-loading-more">
                        Loading more anime...
                    </div>

                )}

            </main>

        </>
    );
}

