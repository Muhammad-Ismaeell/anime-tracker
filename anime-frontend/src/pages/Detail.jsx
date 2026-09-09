
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
    useToggleFavorite,
} from "../hooks/user/useFavorites";

import {
    useFavoriteIds,
} from "../hooks/user/useFavoriteIds";

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

    const { id } = useParams();


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

    const favoriteIds =
        useFavoriteIds();

    const toggleFavorite =
        useToggleFavorite();


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
    ] = useState(null);

    const [
        isProgressEditing,
        setIsProgressEditing,
    ] = useState(false);

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

    // Prefer the normalized large image so the detail poster uses
    // the same high-resolution source as AnimeCard.
    const image =
        anime.largeImage ??
        anime.images?.webp?.large_image_url ??
        anime.images?.jpg?.large_image_url ??
        anime.image_large ??
        anime.image ??
        anime.images?.webp?.image_url ??
        anime.images?.jpg?.image_url ??
        "/no-image.png";


    const title =
        anime.title_english ||
        anime.title ||
        "Unknown Anime";


    const episodeCount =
        Number(anime.episodes) ||
        Number(libraryItem?.anime?.episodes) ||
        0;

    const hasKnownEpisodeCount = episodeCount > 0;


    // ============================================================
    // FAVORITE STATE
    // ============================================================

    const liked =
        favoriteIds.has(
            String(anime.id)
        );


    // ============================================================
    // SAFE STORED PROGRESS
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


    // ============================================================
    // DISPLAYED PROGRESS
    // ============================================================

    const displayedProgress =
        isProgressEditing
            ? Math.max(
                0,
                hasKnownEpisodeCount
                    ? Math.min(
                        Number(progressDraft) || 0,
                        episodeCount
                    )
                    : Number(progressDraft) || 0
            )
            : safeStoredProgress;


    // ============================================================
    // PROGRESS PERCENTAGE
    // ============================================================

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


    // ============================================================
    // PROGRESS LABEL
    // ============================================================

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
    // LIBRARY STATUS HANDLER
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

            // ====================================================
            // REMOVE
            // ====================================================

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

            // ====================================================
            // WATCHING
            // ====================================================

            if (
                status === "watching"
            ) {

                const nextProgress =
                    currentStatus === "watching"
                        ? safeStoredProgress
                        : 0;

                setProgressDraft(
                    nextProgress
                );

                setIsProgressEditing(false);
                setLibraryMenuOpen(
                    false
                );

                if (
                    currentStatus !==
                    "watching"
                ) {

                    updateLibrary.mutate({
                        anime_id:
                            String(id),
                        status:
                            "watching",
                        progress:
                            nextProgress,
                        title:
                            anime.title,
                        image,
                    });
                }

                return;
            }

            // ====================================================
            // PLAN TO WATCH
            // ====================================================

            if (
                status ===
                "plan_to_watch"
            ) {

                setProgressDraft(
                    0
                );
                setIsProgressEditing(false);

                setLibraryMenuOpen(
                    false
                );

                updateLibrary.mutate({
                    anime_id:
                        String(id),
                    status:
                        "plan_to_watch",
                    progress:
                        0,
                    title:
                        anime.title,
                    image,
                });

                return;
            }

            // ====================================================
            // COMPLETED
            // ====================================================

            if (
                status ===
                "completed"
            ) {

                const completedProgress =
                    hasKnownEpisodeCount
                        ? episodeCount
                        : safeStoredProgress;

                setProgressDraft(
                    completedProgress
                );
                setIsProgressEditing(false);

                setLibraryMenuOpen(
                    false
                );

                updateLibrary.mutate({
                    anime_id:
                        String(id),
                    status:
                        "completed",
                    progress:
                        completedProgress,
                    title:
                        anime.title,
                    image,
                });

                return;
            }

            // ====================================================
            // DROPPED
            // ====================================================

            if (
                status ===
                "dropped"
            ) {

                setLibraryMenuOpen(
                    false
                );

                updateLibrary.mutate({
                    anime_id:
                        String(id),
                    status:
                        "dropped",
                    progress:
                        safeStoredProgress,
                    title:
                        anime.title,
                    image,
                });

                return;
            }
        };


    // ============================================================
    // PROGRESS CHANGE
    // ============================================================

    const changeProgress = (amount) => {

        let nextProgress =
            isProgressEditing
                ? Number(progressDraft)
                : safeStoredProgress;

        if (!Number.isFinite(nextProgress)) {
            nextProgress = 0;
        }

        nextProgress =
            Math.floor(nextProgress) + amount;

        nextProgress =
            Math.max(0, nextProgress);

        if (hasKnownEpisodeCount) {
            nextProgress =
                Math.min(
                    nextProgress,
                    episodeCount
                );
        }

        setProgressDraft(nextProgress);
        setIsProgressEditing(true);
    };


    // ============================================================
    // PROGRESS INPUT HANDLER
    // ============================================================

    const handleProgressInput = (event) => {

        const value =
            event.target.value;

        if (value === "") {

            setProgressDraft("");
            setIsProgressEditing(true);

            return;
        }

        let nextProgress =
            Number(value);

        if (!Number.isFinite(nextProgress)) {
            return;
        }

        nextProgress =
            Math.max(
                0,
                Math.floor(nextProgress)
            );

        if (hasKnownEpisodeCount) {
            nextProgress =
                Math.min(
                    nextProgress,
                    episodeCount
                );
        }

        setProgressDraft(nextProgress);
        setIsProgressEditing(true);
    };


    // ============================================================
    // SAVE PROGRESS
    // ============================================================

    const handleSaveProgress = () => {

        let safeProgress =
            isProgressEditing
                ? Number(progressDraft)
                : safeStoredProgress;

        if (!Number.isFinite(safeProgress)) {
            safeProgress = 0;
        }

        safeProgress =
            Math.max(
                0,
                Math.floor(safeProgress)
            );

        if (hasKnownEpisodeCount) {
            safeProgress =
                Math.min(
                    safeProgress,
                    episodeCount
                );
        }

        setProgressDraft(safeProgress);
        setIsProgressEditing(false);

        updateLibrary.mutate({
            anime_id: String(id),
            status: "watching",
            progress: safeProgress,
            title: anime.title,
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
                                    LIBRARY CONTROL
                                ================================================== */}
                                <div className="detail-library-control">
                                    <button
                                        type="button"
                                        className={`detail-library-button ${
                                            currentStatus ||
                                            "none"
                                        }`}
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                showLoginRequired();
                                                return;
                                            }

                                            setLibraryMenuOpen(
                                                (open) => !open
                                            );
                                        }}
                                    >
                                        {statusLabel}
                                    </button>

                                    {libraryMenuOpen && (
                                        <div className="detail-library-menu">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleLibraryStatus("watching")
                                                }
                                            >
                                                📺 Watching
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleLibraryStatus("completed")
                                                }
                                            >
                                                ✅ Completed
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleLibraryStatus("plan_to_watch")
                                                }
                                            >
                                                📌 Plan to Watch
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleLibraryStatus("dropped")
                                                }
                                            >
                                                ❌ Dropped
                                            </button>

                                            {currentStatus && (
                                                <button
                                                    type="button"
                                                    className="remove"
                                                    onClick={() =>
                                                        handleLibraryStatus("remove")
                                                    }
                                                >
                                                    🗑 Remove from Library
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className={`detail-favorite-button ${
                                        liked ? "liked" : ""
                                    }`}
                                    onClick={handleFavorite}
                                    aria-label={
                                        liked
                                            ? "Remove from favorites"
                                            : "Add to favorites"
                                    }
                                >
                                    {liked ? "♥" : "♡"}
                                </button>
                            </div>

                            {/* ==================================================
                                PROGRESS
                            ================================================== */}
                            {currentStatus === "watching" && (
                                <div className="detail-progress">
                                    <div className="detail-progress-header">
                                        <span>Progress</span>
                                        <span>{progressLabel}</span>
                                    </div>

                                    {progressPercentage !== null && (
                                        <div className="detail-progress-bar">
                                            <div
                                                className="detail-progress-fill"
                                                style={{
                                                    width: `${progressPercentage}%`,
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="detail-progress-controls">
                                        <button
                                            type="button"
                                            onClick={() => changeProgress(-1)}
                                            disabled={displayedProgress <= 0}
                                        >
                                            −
                                        </button>

                                        <input
                                            type="number"
                                            min="0"
                                            max={
                                                hasKnownEpisodeCount
                                                    ? episodeCount
                                                    : undefined
                                            }
                                            value={
                                                isProgressEditing
                                                    ? progressDraft
                                                    : safeStoredProgress
                                            }
                                            onChange={handleProgressInput}
                                            aria-label="Episodes watched"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => changeProgress(1)}
                                            disabled={
                                                hasKnownEpisodeCount &&
                                                displayedProgress >= episodeCount
                                            }
                                        >
                                            +
                                        </button>

                                        <button
                                            type="button"
                                            className="save-progress"
                                            onClick={handleSaveProgress}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}

                            {anime.synopsis && (
                                <p className="anime-synopsis">
                                    {anime.synopsis}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ==================================================
                        ADDITIONAL DETAILS
                    ================================================== */}
                    <div className="anime-detail-sections">
                        {anime.genres?.length > 0 && (
                            <section className="detail-section">
                                <h2>Genres</h2>
                                <div className="genre-list">
                                    {anime.genres.map((genre) => (
                                        <span
                                            key={genre.mal_id ?? genre.name}
                                            className="genre-tag"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {anime.studios?.length > 0 && (
                            <section className="detail-section">
                                <h2>Studios</h2>
                                <div className="genre-list">
                                    {anime.studios.map((studio) => (
                                        <span
                                            key={studio.mal_id ?? studio.name}
                                            className="genre-tag"
                                        >
                                            {studio.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {anime.themes?.length > 0 && (
                            <section className="detail-section">
                                <h2>Themes</h2>
                                <div className="genre-list">
                                    {anime.themes.map((theme) => (
                                        <span
                                            key={theme.mal_id ?? theme.name}
                                            className="genre-tag"
                                        >
                                            {theme.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <ReviewSection animeId={anime.id} />
                </div>
            </div>
        </PageContainer>
    );
}

export default Detail;
