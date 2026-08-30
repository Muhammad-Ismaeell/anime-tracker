
import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

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


const GENRES = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sports",
    "Supernatural",
];


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


    const { statusMap } =
        useGlobalLibrary();


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
    ] = useState({

        year:
            params.get("year") ||
            "",

        season:
            params.get("season") ||
            "",

        type:
            params.get("type") ||
            "",

        status:
            params.get("status") ||
            "",

        genres:
            params.get("genres") ||
            "",

        min_score:
            params.get("min_score") ||
            "",

        order_by:
            params.get("order_by") ||
            "",

        sort:
            params.get("sort") ||
            "",

    });


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


    // ============================================================
    // SEARCH STATE
    // ============================================================

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
    // SEARCH QUERY
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


    const { favoriteIds } =
        useMemo(() => {

            const ids =
                new Set(

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


            return {
                favoriteIds: ids,
            };

        }, [
            favoritesRes,
        ]);


    // ============================================================
    // RESULTS
    // ============================================================

    const results =
        useMemo(() => {

            return (
                data?.pages ??
                []
            ).flatMap(
                (page) =>
                    page?.items ??
                    []
            );

        }, [
            data,
        ]);


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


                /*
                 * Replace the current URL instead
                 * of creating a new browser history
                 * entry for every search/filter change.
                 */
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
    // FILTER HELPERS
    // ============================================================

    const clearFilter = (
        filterName
    ) => {

        setFilters(
            (prev) => ({
                ...prev,
                [filterName]: "",
            })
        );

    };


    const clearYear = () => {

        setFilters(
            (prev) => ({
                ...prev,
                year: "",
                season: "",
            })
        );

    };


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <>

            <Helmet>

                <title>
                    Discover Anime | Anime Tracker
                </title>


                <meta
                    name="description"
                    content="Discover and search anime by title, genre, year, season, type, status and score."
                />

            </Helmet>


            <div className="page">

                {/* ==================================================
                    SEARCH / DISCOVER HERO
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
                            Search and explore anime by title,
                            genre, season, type, status, and score.
                        </p>

                    </div>


                    {/* ==================================================
                        SEARCH BOX
                    ================================================== */}

                    <div className="search-box">

                        <span
                            className="search-box-icon"
                            aria-hidden="true"
                        >
                            🔎
                        </span>


                        <input
                            className="search-input"

                            value={
                                query
                            }

                            onChange={(e) =>
                                setQuery(
                                    e.target.value
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


                    {/* ==================================================
                        FILTERS
                    ================================================== */}

                    <div className="advanced-filters">

                        {/* YEAR */}

                        <input
                            className="filter-input"

                            type="number"

                            placeholder="Year"

                            value={
                                filters.year
                            }

                            onChange={(e) =>
                                setFilters(
                                    (prev) => ({
                                        ...prev,
                                        year:
                                            e.target.value,
                                    })
                                )
                            }
                        />


                        {/* SEASON */}

                        <select
                            className="filter-input"

                            disabled={
                                !filters.year
                            }

                            value={
                                filters.season
                            }

                            onChange={(e) =>
                                setFilters(
                                    (prev) => ({
                                        ...prev,
                                        season:
                                            e.target.value,
                                    })
                                )
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


                        {/* TYPE */}

                        <select
                            className="filter-input"

                            value={
                                filters.type
                            }

                            onChange={(e) =>
                                setFilters(
                                    (prev) => ({
                                        ...prev,
                                        type:
                                            e.target.value,
                                    })
                                )
                            }
                        >

                            <option value="">
                                Any Type
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


                        {/* STATUS */}

                        <select
                            className="filter-input"

                            value={
                                filters.status
                            }

                            onChange={(e) =>
                                setFilters(
                                    (prev) => ({
                                        ...prev,
                                        status:
                                            e.target.value,
                                    })
                                )
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


                        {/* GENRE */}

                        <select
                            className="filter-input"

                            value={
                                filters.genres
                            }

                            onChange={(e) =>
                                setFilters(
                                    (prev) => ({
                                        ...prev,
                                        genres:
                                            e.target.value,
                                    })
                                )
                            }
                        >

                            <option value="">
                                Any Genre
                            </option>

                            {GENRES.map(
                                (genre) => (

                                    <option
                                        key={
                                            genre
                                        }

                                        value={
                                            genre
                                        }
                                    >
                                        {
                                            genre
                                        }
                                    </option>

                                )
                            )}

                        </select>


                        {/* MINIMUM SCORE */}

                        <input
                            className="filter-input"

                            type="number"

                            min="0"

                            max="10"

                            step="0.1"

                            placeholder="Min Score"

                            value={
                                filters.min_score
                            }

                            onChange={(e) =>
                                setFilters(
                                    (prev) => ({
                                        ...prev,
                                        min_score:
                                            e.target.value,
                                    })
                                )
                            }
                        />

                    </div>


                    {/* ==================================================
                        ACTIVE FILTERS
                    ================================================== */}

                    {hasFilters && (

                        <div className="active-search-filters">

                            <span className="active-filters-label">
                                Active filters:
                            </span>


                            {filters.genres && (

                                <button
                                    type="button"

                                    className="active-filter"

                                    onClick={() =>
                                        clearFilter(
                                            "genres"
                                        )
                                    }
                                >

                                    {
                                        filters.genres
                                    }

                                    <span aria-hidden="true">
                                        ×
                                    </span>

                                </button>

                            )}


                            {filters.year && (

                                <button
                                    type="button"

                                    className="active-filter"

                                    onClick={
                                        clearYear
                                    }
                                >

                                    {
                                        filters.year
                                    }

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
                                        clearFilter(
                                            "season"
                                        )
                                    }
                                >

                                    {
                                        filters.season
                                    }

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
                                        clearFilter(
                                            "type"
                                        )
                                    }
                                >

                                    {
                                        filters.type
                                    }

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
                                        clearFilter(
                                            "status"
                                        )
                                    }
                                >

                                    {
                                        filters.status
                                    }

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
                                        clearFilter(
                                            "min_score"
                                        )
                                    }
                                >

                                    {
                                        `Score ${filters.min_score}+`
                                    }

                                    <span aria-hidden="true">
                                        ×
                                    </span>

                                </button>

                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    RESULTS
                ================================================== */}

                {
                    isLoading &&
                    results.length === 0 ? (

                        <div className="grid">

                            {
                                Array.from({
                                    length: 12,
                                }).map(
                                    (_, index) => (

                                        <AnimeCardSkeleton
                                            key={
                                                index
                                            }
                                        />

                                    )
                                )
                            }

                        </div>

                    ) : isError ? (

                        <div className="error-state">

                            <h2>
                                😢 Something went wrong
                            </h2>


                            <p>
                                {
                                    error?.message ||
                                    "Failed to load anime."
                                }
                            </p>


                            <button
                                type="button"

                                onClick={
                                    refetch
                                }

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

                        <>

                            <div className="search-results-header">

                                <div>

                                    <span className="search-results-eyebrow">
                                        {isSearching
                                            ? "RESULTS"
                                            : "DISCOVER"
                                        }
                                    </span>


                                    <h2 className="search-results-title">
                                        {isSearching
                                            ? "Search Results"
                                            : "Discover Anime"
                                        }
                                    </h2>

                                </div>


                                <span className="search-results-count">
                                    {results.length}
                                    {hasNextPage
                                        ? "+"
                                        : ""
                                    } anime
                                </span>

                            </div>


                            <div className="grid">

                                {
                                    results.map(
                                        (anime) => {

                                            const animeId =
                                                anime.id ??
                                                anime.mal_id;

                                            const id =
                                                String(
                                                    animeId
                                                );


                                            return (

                                                <AnimeCard
                                                    key={
                                                        id
                                                    }

                                                    anime={
                                                        anime
                                                    }

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
                                    )
                                }

                            </div>

                        </>

                    )
                }


                {/* ==================================================
                    INFINITE SCROLL SENTINEL
                ================================================== */}

                <div
                    ref={
                        loadMoreRef
                    }

                    style={{
                        height: 40,
                    }}
                />


                {
                    isFetchingNextPage && (

                        <div className="empty-state">
                            Loading more anime...
                        </div>

                    )
                }

            </div>

        </>
    );
}

