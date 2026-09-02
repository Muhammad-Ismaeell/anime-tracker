import {
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useParams } from "react-router-dom";

import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";
import ReviewSection from "../components/review/ReviewSection";
import AnimeDetailSkeleton from "../components/skeletons/AnimeDetailSkeleton";

import { useAnimeDetail } from "../hooks/useAnimeDetail";
import { useAuthPrompt } from "../context/useAuthPrompt";
import { AuthContext } from "../context/AuthContext";

import {
    useFavorites,
    useToggleFavorite,
} from "../hooks/user/useFavorites";

import {
    useGlobalLibrary,
} from "../hooks/useGlobalLibrary";

import {
    useUpdateLibrary,
} from "../hooks/useLibrary";

import { Helmet } from "react-helmet-async";

import OptimizedImage from "../components/ui/OptimizedImage";
import "../detail.css";

function Detail() {

    const { id } =
        useParams();


    const {
        isAuthenticated,
    } = useContext(AuthContext);


    const {
        showLoginRequired,
    } = useAuthPrompt();


    const {
        data: anime,
        isLoading,
        isError,
        refetch,
    } = useAnimeDetail(id);


    // ============================================================
    // FAVORITES
    // ============================================================

    const {
        data: favoritesPage,
    } = useFavorites();


    const toggleFavorite =
        useToggleFavorite();


    const favorites =
        favoritesPage?.results ?? [];


    // ============================================================
    // LIBRARY
    // ============================================================

    const {
        libraryMap,
    } = useGlobalLibrary();


    const updateLibrary =
        useUpdateLibrary();


    const libraryItem =
        useMemo(() => {

            if (
                !(libraryMap instanceof Map) ||
                !id
            ) {
                return undefined;
            }


            return libraryMap.get(
                String(id)
            );

        }, [
            libraryMap,
            id,
        ]);


    const currentStatus =
        libraryItem?.status ?? null;


    const storedProgress =
        Number(
            libraryItem?.progress ?? 0
        ) || 0;


    // ============================================================
    // LOCAL UI STATE
    // ============================================================

    const [
        libraryMenuOpen,
        setLibraryMenuOpen,
    ] = useState(false);


    const [
        progressDraft,
        setProgressDraft,
    ] = useState(() => storedProgress);

    // ============================================================
    // SCROLL
    // ============================================================

    useEffect(() => {

        window.scrollTo(
            0,
            0
        );

    }, []);


    // ============================================================
    // VALIDATION
    // ============================================================

    if (!id) {

        return (
            <PageContainer>

                Invalid anime id

            </PageContainer>
        );
    }


    // ============================================================
    // LOADING
    // ============================================================

    if (isLoading) {

        return (
            <PageContainer>

                <AnimeDetailSkeleton />

            </PageContainer>
        );
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (
        isError ||
        !anime
    ) {

        return (
            <PageContainer>

                <EmptyState
                    text="Failed to load anime."
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


    // ============================================================
    // ANIME DATA
    // ============================================================

    const image =
        anime.image ??
        anime.images?.webp?.large_image_url ??
        anime.images?.jpg?.large_image_url ??
        anime.images?.webp?.image_url ??
        anime.images?.jpg?.image_url ??
        "/no-image.png";


    const title =
        anime.title_english ||
        anime.title ||
        "Unknown Anime";


    const episodeCount =
        Number(
            anime.episodes
        ) || 0;


    const hasKnownEpisodeCount =
        episodeCount > 0;


    // ============================================================
    // FAVORITE STATE
    // ============================================================

    const liked =
        favorites.some(
            (favorite) => {

                const favoriteAnimeId =
                    favorite.anime?.mal_id ??
                    favorite.anime?.id ??
                    favorite.anime_id ??
                    favorite.mal_id;


                return (
                    favoriteAnimeId != null &&
                    String(
                        favoriteAnimeId
                    ) ===
                    String(
                        anime.id
                    )
                );
            }
        );


    // ============================================================
    // PROGRESS
    // ============================================================

    const safeStoredProgress =
        Math.max(
            0,
            hasKnownEpisodeCount
                ? Math.min(
                    storedProgress,
                    episodeCount
                )
                : storedProgress
        );


    const displayedProgress =
        Number.isFinite(
            Number(progressDraft)
        )
            ? Math.max(
                0,
                hasKnownEpisodeCount
                    ? Math.min(
                        Number(progressDraft),
                        episodeCount
                    )
                    : Number(progressDraft)
            )
            : safeStoredProgress;


    const progressPercentage =
        hasKnownEpisodeCount
            ? Math.round(
                (
                    displayedProgress /
                    episodeCount
                ) *
                100
            )
            : null;


    const progressLabel =
        hasKnownEpisodeCount
            ? `${displayedProgress} / ${episodeCount}`
            : `${displayedProgress} episodes watched`;


    // ============================================================
    // FAVORITE HANDLER
    // ============================================================

    const handleFavorite = () => {

        if (!isAuthenticated) {

            showLoginRequired();

            return;
        }


        if (!anime?.id) {
            return;
        }


        toggleFavorite.mutate({

            anime_id:
                anime.id,

            title:
                anime.title,

            image,

        });
    };


    // ============================================================
    // LIBRARY STATUS
    // ============================================================

    const handleLibraryStatus =
        (status) => {

            if (!isAuthenticated) {

                setLibraryMenuOpen(
                    false
                );

                showLoginRequired();

                return;
            }


            // ----------------------------------------------------
            // REMOVE
            // ----------------------------------------------------

            if (
                status === "remove"
            ) {

                setLibraryMenuOpen(
                    false
                );


                updateLibrary.mutate({

                    anime_id:
                        String(id),

                    remove:
                        true,

                });

                return;
            }


            // ----------------------------------------------------
            // WATCHING
            // ----------------------------------------------------

            if (status === "watching") {
                const nextProgress =
                    currentStatus === "completed"
                        ? 0
                        : safeStoredProgress;

                setProgressDraft(
                    nextProgress
                );

                setLibraryMenuOpen(
                    false
                );

                if (currentStatus !== "watching") {
                    updateLibrary.mutate({
                        anime_id: String(id),
                        status: "watching",
                        progress: nextProgress,
                        title: anime.title,
                        image,
                    });
                }

                return;
            }


            // ----------------------------------------------------
            // OTHER STATUSES
            // ----------------------------------------------------

            setLibraryMenuOpen(
                false
            );


            updateLibrary.mutate({

                anime_id:
                    String(id),

                status,

                title:
                    anime.title,

                image,

            });
        };


    // ============================================================
    // PROGRESS CHANGE
    // ============================================================

    const changeProgress =
        (amount) => {

            let nextProgress =
                Number(
                    progressDraft
                );


            if (
                !Number.isFinite(
                    nextProgress
                )
            ) {

                nextProgress =
                    safeStoredProgress;
            }


            nextProgress =
                Math.floor(
                    nextProgress
                ) +
                amount;


            nextProgress =
                Math.max(
                    0,
                    nextProgress
                );


            if (
                hasKnownEpisodeCount
            ) {

                nextProgress =
                    Math.min(
                        nextProgress,
                        episodeCount
                    );
            }


            setProgressDraft(
                nextProgress
            );
        };


    // ============================================================
    // SAVE PROGRESS
    // ============================================================

    const handleSaveProgress =
        () => {

            let safeProgress =
                Number(
                    progressDraft
                );


            if (
                !Number.isFinite(
                    safeProgress
                )
            ) {

                safeProgress =
                    0;
            }


            safeProgress =
                Math.max(
                    0,
                    Math.floor(
                        safeProgress
                    )
                );


            if (
                hasKnownEpisodeCount
            ) {

                safeProgress =
                    Math.min(
                        safeProgress,
                        episodeCount
                    );
            }


            setProgressDraft(
                safeProgress
            );


            updateLibrary.mutate({

                anime_id:
                    String(id),

                status:
                    "watching",

                progress:
                    safeProgress,

                title:
                    anime.title,

                image,

            });
        };


    // ============================================================
    // STATUS DISPLAY
    // ============================================================

    const statusLabelMap = {

        watching:
            "📺 Watching",

        completed:
            "✅ Completed",

        dropped:
            "❌ Dropped",

        plan_to_watch:
            "📌 Plan to Watch",

    };


    const statusLabel =
        currentStatus
            ? statusLabelMap[
                currentStatus
            ] ??
            currentStatus.replaceAll(
                "_",
                " "
            )
            : "＋ Add to Library";


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <PageContainer>

            <Helmet>

                <title>
                    {anime.title} | Anime Tracker
                </title>


                <meta
                    name="description"
                    content={
                        anime.synopsis ||
                        `Read about ${anime.title}.`
                    }
                />

            </Helmet>


            <div className="detail-premium">

                <div className="anime-detail-container">


                    {/* ==================================================
                        BACKDROP
                    ================================================== */}

                    <div className="anime-backdrop">

                        <OptimizedImage
                            src={image}
                            alt={anime.title}
                            loading="eager"
                        />

                    </div>


                    {/* ==================================================
                        MAIN DETAIL CARD
                    ================================================== */}

                    <div className="anime-detail-card">


                        {/* ==================================================
                            POSTER
                        ================================================== */}

                        <div className="anime-poster">

                            <OptimizedImage
                                src={image}
                                alt={title}
                                loading="eager"
                            />

                        </div>


                        {/* ==================================================
                            MAIN INFO
                        ================================================== */}

                        <div className="anime-main-info">

                            <span className="anime-detail-eyebrow">
                                ANIME DETAILS
                            </span>


                            <h1>
                                {title}
                            </h1>


                            {/* ==================================================
                                STATS
                            ================================================== */}

                            <div className="detail-stats">

                                {anime.score != null && (

                                    <span className="detail-stat score">

                                        ⭐{" "}
                                        {anime.score}

                                    </span>

                                )}


                                {anime.type && (

                                    <span className="detail-stat">

                                        📺{" "}
                                        {anime.type}

                                    </span>

                                )}


                                {anime.episodes != null && (

                                    <span className="detail-stat">

                                        🎬{" "}
                                        {anime.episodes}{" "}
                                        Episodes

                                    </span>

                                )}


                                {anime.year && (

                                    <span className="detail-stat">

                                        📅{" "}
                                        {anime.year}

                                    </span>

                                )}

                            </div>


                            {/* ==================================================
                                ACTIONS
                            ================================================== */}

                            <div className="detail-actions">


                                {/* ==================================================
                                    LIBRARY
                                ================================================== */}

                                <div className="detail-library-control">

                                    <button
                                        type="button"
                                        className={`detail-library-button ${
                                            currentStatus ||
                                            "none"
                                        }`}
                                        onClick={() => {

                                            if (
                                                !isAuthenticated
                                            ) {

                                                showLoginRequired();

                                                return;
                                            }


                                            setLibraryMenuOpen(
                                                (current) =>
                                                    !current
                                            );

                                        }}
                                        disabled={
                                            isAuthenticated &&
                                            updateLibrary.isPending
                                        }
                                    >

                                        {isAuthenticated &&
                                        updateLibrary.isPending
                                            ? "Updating..."
                                            : statusLabel}


                                        <span
                                            className="detail-library-chevron"
                                            aria-hidden="true"
                                        >
                                            ▾
                                        </span>

                                    </button>


                                    {libraryMenuOpen &&
                                    isAuthenticated && (

                                        <div
                                            className="detail-library-menu"
                                            role="menu"
                                        >

                                            <button
                                                type="button"
                                                role="menuitem"
                                                className={
                                                    currentStatus ===
                                                    "watching"
                                                        ? "selected"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    handleLibraryStatus(
                                                        "watching"
                                                    )
                                                }
                                            >

                                                📺 Watching

                                            </button>


                                            <button
                                                type="button"
                                                role="menuitem"
                                                className={
                                                    currentStatus ===
                                                    "completed"
                                                        ? "selected"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    handleLibraryStatus(
                                                        "completed"
                                                    )
                                                }
                                            >

                                                ✅ Completed

                                            </button>


                                            <button
                                                type="button"
                                                role="menuitem"
                                                className={
                                                    currentStatus ===
                                                    "dropped"
                                                        ? "selected"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    handleLibraryStatus(
                                                        "dropped"
                                                    )
                                                }
                                            >

                                                ❌ Dropped

                                            </button>


                                            <button
                                                type="button"
                                                role="menuitem"
                                                className={
                                                    currentStatus ===
                                                    "plan_to_watch"
                                                        ? "selected"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    handleLibraryStatus(
                                                        "plan_to_watch"
                                                    )
                                                }
                                            >

                                                📌 Plan to Watch

                                            </button>


                                            {currentStatus && (

                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    className="danger"
                                                    onClick={() =>
                                                        handleLibraryStatus(
                                                            "remove"
                                                        )
                                                    }
                                                >

                                                    🗑 Remove from Library

                                                </button>

                                            )}

                                        </div>

                                    )}

                                </div>


                                {/* ==================================================
                                    FAVORITE
                                ================================================== */}

                                <button
                                    type="button"
                                    className={`favorite-button ${
                                        liked
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={
                                        handleFavorite
                                    }
                                    disabled={
                                        isAuthenticated &&
                                        toggleFavorite.isPending
                                    }
                                    aria-label={
                                        liked
                                            ? `Remove ${title} from favorites`
                                            : `Add ${title} to favorites`
                                    }
                                >

                                    {toggleFavorite.isPending

                                        ? "Saving..."

                                        : liked

                                            ? "❤️ Remove Favorite"

                                            : "♡ Add to Favorites"}

                                </button>

                            </div>


                            {/* ==================================================
                                PROGRESS
                            ================================================== */}

                            {isAuthenticated &&
                            currentStatus && (

                                <div className="detail-progress-card">


                                    <div className="detail-progress-header">

                                        <div>

                                            <span className="detail-progress-eyebrow">
                                                YOUR PROGRESS
                                            </span>


                                            <h3>
                                                {currentStatus ===
                                                "completed"

                                                    ? "Completed"

                                                    : "Episodes watched"}

                                            </h3>

                                        </div>


                                        {progressPercentage !==
                                            null && (

                                            <strong>
                                                {
                                                    progressPercentage
                                                }%
                                            </strong>

                                        )}

                                    </div>


                                    <div className="detail-progress-info">

                                        <span>
                                            {progressLabel}
                                        </span>


                                        {currentStatus ===
                                            "completed" &&
                                        hasKnownEpisodeCount && (

                                            <span>
                                                Full series
                                            </span>

                                        )}

                                    </div>


                                    {hasKnownEpisodeCount && (

                                        <div
                                            className="detail-progress-track"
                                            aria-label={`Progress: ${progressPercentage}%`}
                                        >

                                            <div
                                                className="detail-progress-fill"
                                                style={{
                                                    width: `${progressPercentage}%`,
                                                }}
                                            />

                                        </div>

                                    )}


                                    {currentStatus ===
                                    "watching" && (

                                        <div className="detail-progress-controls">

                                            <button
                                                type="button"
                                                className="detail-progress-step"
                                                onClick={() =>
                                                    changeProgress(
                                                        -1
                                                    )
                                                }
                                                disabled={
                                                    displayedProgress <=
                                                    0
                                                }
                                                aria-label="Decrease episode progress"
                                            >
                                                −
                                            </button>


                                            <input
                                                type="number"
                                                className="detail-progress-input"
                                                min="0"
                                                max={
                                                    hasKnownEpisodeCount
                                                        ? episodeCount
                                                        : undefined
                                                }
                                                value={progressDraft}
                                                onChange={(event) => {
                                                    const value = event.target.value;

                                                    if (value === "") {
                                                        setProgressDraft("");
                                                        return;
                                                    }

                                                    let next = Number(value);

                                                    if (!Number.isFinite(next)) {
                                                        return;
                                                    }

                                                    next = Math.max(0, Math.floor(next));

                                                    if (hasKnownEpisodeCount) {
                                                        next = Math.min(
                                                            next,
                                                            episodeCount
                                                        );
                                                    }

                                                    setProgressDraft(next);
                                                }}
                                                aria-label="Episodes watched"
                                            />


                                            <button
                                                type="button"
                                                className="detail-progress-step"
                                                onClick={() =>
                                                    changeProgress(
                                                        1
                                                    )
                                                }
                                                disabled={
                                                    hasKnownEpisodeCount &&
                                                    displayedProgress >=
                                                    episodeCount
                                                }
                                                aria-label="Increase episode progress"
                                            >
                                                +
                                            </button>


                                            <button
                                                type="button"
                                                className="detail-progress-save"
                                                onClick={
                                                    handleSaveProgress
                                                }
                                                disabled={
                                                    updateLibrary.isPending
                                                }
                                            >

                                                {updateLibrary.isPending
                                                    ? "Saving..."
                                                    : "Save"}

                                            </button>

                                        </div>

                                    )}


                                    {!hasKnownEpisodeCount && (

                                        <p className="detail-progress-note">

                                            Episode count is currently
                                            unavailable, so percentage
                                            progress cannot be calculated.

                                        </p>

                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        SYNOPSIS
                    ================================================== */}

                    <div className="anime-section">

                        <h2>
                            Synopsis
                        </h2>


                        <p>
                            {anime.synopsis ||
                                "No synopsis available."}
                        </p>

                    </div>


                    {/* ==================================================
                        REVIEWS
                    ================================================== */}

                    <ReviewSection
                        animeId={id}
                    />

                </div>

            </div>

        </PageContainer>
    );
}


export default Detail;