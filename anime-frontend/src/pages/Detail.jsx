
import { useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";
import ReviewSection from "../components/review/ReviewSection";
import AnimeDetailSkeleton from "../components/skeletons/AnimeDetailSkeleton";
import OptimizedImage from "../components/ui/OptimizedImage";
import TrailerSection from "../components/detail/TrailerSection";

import { useAnimeDetail } from "../hooks/useAnimeDetail";
import { useAuthPrompt } from "../context/useAuthPrompt";
import { AuthContext } from "../context/AuthContext";
import { useToggleFavorite } from "../hooks/user/useFavorites";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import { useUpdateLibrary } from "../hooks/useLibrary";

import "../detail.css";
import "../components/detail/TrailerSection.css";

function Detail() {
    const { id } = useParams();

    const { isAuthenticated } = useContext(AuthContext);
    const { showLoginRequired } = useAuthPrompt();

    const {
        data: anime,
        isLoading,
        isError,
        refetch,
    } = useAnimeDetail(id);

    const favoriteIds = useFavoriteIds();
    const toggleFavorite = useToggleFavorite();

    const { libraryMap } = useGlobalLibrary();
    const updateLibrary = useUpdateLibrary();

    const libraryItem = useMemo(() => {
        if (!(libraryMap instanceof Map) || !id) {
            return undefined;
        }

        return libraryMap.get(String(id));
    }, [libraryMap, id]);

    const currentStatus = libraryItem?.status ?? null;

    const storedProgress =
        Number(libraryItem?.progress ?? 0) || 0;

    const [libraryMenuOpen, setLibraryMenuOpen] = useState(false);
    const [progressDraft, setProgressDraft] = useState(null);
    const [isProgressEditing, setIsProgressEditing] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!id) {
        return (
            <PageContainer>
                Invalid anime id
            </PageContainer>
        );
    }

    if (isLoading) {
        return (
            <PageContainer>
                <AnimeDetailSkeleton />
            </PageContainer>
        );
    }

    if (isError || !anime) {
        return (
            <PageContainer>
                <EmptyState text="Failed to load anime." />

                <button
                    className="retry-btn"
                    onClick={refetch}
                >
                    Retry
                </button>
            </PageContainer>
        );
    }

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

    const liked = favoriteIds.has(String(anime.id));

    const safeStoredProgress = Math.max(
        0,
        hasKnownEpisodeCount
            ? Math.min(storedProgress, episodeCount)
            : storedProgress
    );

    const displayedProgress = isProgressEditing
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

    const progressPercentage = hasKnownEpisodeCount
        ? Math.round(
            (displayedProgress / episodeCount) * 100
        )
        : null;

    const progressLabel = hasKnownEpisodeCount
        ? `${displayedProgress} / ${episodeCount}`
        : `${displayedProgress} episodes watched`;

    const handleFavorite = () => {
        if (!isAuthenticated) {
            showLoginRequired();
            return;
        }

        if (!anime?.id) {
            return;
        }

        toggleFavorite.mutate({
            anime_id: anime.id,
            title: anime.title,
            image,
        });
    };

    const handleLibraryStatus = (status) => {
        if (!isAuthenticated) {
            setLibraryMenuOpen(false);
            showLoginRequired();
            return;
        }

        if (status === "remove") {
            setLibraryMenuOpen(false);

            updateLibrary.mutate({
                anime_id: String(id),
                remove: true,
            });

            return;
        }

        if (status === "watching") {
            const nextProgress =
                currentStatus === "watching"
                    ? safeStoredProgress
                    : 0;

            setProgressDraft(nextProgress);
            setIsProgressEditing(false);
            setLibraryMenuOpen(false);

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

        if (status === "plan_to_watch") {
            setProgressDraft(0);
            setIsProgressEditing(false);
            setLibraryMenuOpen(false);

            updateLibrary.mutate({
                anime_id: String(id),
                status: "plan_to_watch",
                progress: 0,
                title: anime.title,
                image,
            });

            return;
        }

        if (status === "completed") {
            const completedProgress = hasKnownEpisodeCount
                ? episodeCount
                : safeStoredProgress;

            setProgressDraft(completedProgress);
            setIsProgressEditing(false);
            setLibraryMenuOpen(false);

            updateLibrary.mutate({
                anime_id: String(id),
                status: "completed",
                progress: completedProgress,
                title: anime.title,
                image,
            });

            return;
        }

        if (status === "dropped") {
            setLibraryMenuOpen(false);

            updateLibrary.mutate({
                anime_id: String(id),
                status: "dropped",
                progress: safeStoredProgress,
                title: anime.title,
                image,
            });
        }
    };

    const changeProgress = (amount) => {
        let nextProgress = isProgressEditing
            ? Number(progressDraft)
            : safeStoredProgress;

        if (!Number.isFinite(nextProgress)) {
            nextProgress = 0;
        }

        nextProgress = Math.floor(nextProgress) + amount;
        nextProgress = Math.max(0, nextProgress);

        if (hasKnownEpisodeCount) {
            nextProgress = Math.min(
                nextProgress,
                episodeCount
            );
        }

        setProgressDraft(nextProgress);
        setIsProgressEditing(true);
    };

    const handleProgressInput = (event) => {
        const value = event.target.value;

        if (value === "") {
            setProgressDraft("");
            setIsProgressEditing(true);
            return;
        }

        let nextProgress = Number(value);

        if (!Number.isFinite(nextProgress)) {
            return;
        }

        nextProgress = Math.max(
            0,
            Math.floor(nextProgress)
        );

        if (hasKnownEpisodeCount) {
            nextProgress = Math.min(
                nextProgress,
                episodeCount
            );
        }

        setProgressDraft(nextProgress);
        setIsProgressEditing(true);
    };

    const handleSaveProgress = () => {
        let safeProgress = isProgressEditing
            ? Number(progressDraft)
            : safeStoredProgress;

        if (!Number.isFinite(safeProgress)) {
            safeProgress = 0;
        }

        safeProgress = Math.max(
            0,
            Math.floor(safeProgress)
        );

        if (hasKnownEpisodeCount) {
            safeProgress = Math.min(
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

    const statusLabelMap = {
        watching: "📺 Watching",
        completed: "✅ Completed",
        dropped: "❌ Dropped",
        plan_to_watch: "📌 Plan to Watch",
    };

    const statusLabel = currentStatus
        ? statusLabelMap[currentStatus] ??
          currentStatus.replaceAll("_", " ")
        : "＋ Add to Library";

    return (
        <PageContainer>
            <Helmet>
                <title>{anime.title} | Anime Tracker</title>

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
                    <div className="anime-backdrop">
                        <OptimizedImage
                            src={image}
                            alt={anime.title}
                            loading="eager"
                        />
                    </div>

                    <div className="anime-detail-card">
                        <div className="anime-poster">
                            <OptimizedImage
                                src={image}
                                alt={title}
                                loading="eager"
                            />
                        </div>

                        <div className="anime-main-info">
                            <span className="anime-detail-eyebrow">
                                ANIME DETAILS
                            </span>

                            <h1>{title}</h1>

                            <div className="detail-stats">
                                {anime.score != null && (
                                    <span className="detail-stat score">
                                        ⭐ {anime.score}
                                    </span>
                                )}

                                {anime.type && (
                                    <span className="detail-stat">
                                        📺 {anime.type}
                                    </span>
                                )}

                                {anime.episodes != null && (
                                    <span className="detail-stat">
                                        🎬 {anime.episodes} Episodes
                                    </span>
                                )}

                                {anime.year && (
                                    <span className="detail-stat">
                                        📅 {anime.year}
                                    </span>
                                )}
                            </div>

                            <div className="detail-actions">
                                <div className="detail-library-control">
                                    <button
                                        type="button"
                                        className={`detail-library-button ${
                                            currentStatus || "none"
                                        }`}
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                showLoginRequired();
                                                return;
                                            }

                                            setLibraryMenuOpen(
                                                (current) => !current
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

                                <button
                                    type="button"
                                    className={`favorite-button ${
                                        liked ? "active" : ""
                                    }`}
                                    onClick={handleFavorite}
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

                            {isAuthenticated && currentStatus && (
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

                                        {progressPercentage !== null && (
                                            <strong>
                                                {progressPercentage}%
                                            </strong>
                                        )}
                                    </div>

                                    <div className="detail-progress-info">
                                        <span>{progressLabel}</span>

                                        {currentStatus ===
                                            "completed" &&
                                        hasKnownEpisodeCount && (
                                            <span>Full series</span>
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

                                    {currentStatus === "watching" && (
                                        <div className="detail-progress-controls">
                                            <button
                                                type="button"
                                                className="detail-progress-step"
                                                onClick={() =>
                                                    changeProgress(-1)
                                                }
                                                disabled={
                                                    displayedProgress <= 0
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
                                                value={
                                                    progressDraft === null
                                                        ? safeStoredProgress
                                                        : progressDraft
                                                }
                                                onChange={
                                                    handleProgressInput
                                                }
                                                aria-label="Episodes watched"
                                            />

                                            <button
                                                type="button"
                                                className="detail-progress-step"
                                                onClick={() =>
                                                    changeProgress(1)
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

                    <TrailerSection trailer={anime.trailer} />

                    <div className="anime-section">
                        <h2>Synopsis</h2>

                        <p>
                            {anime.synopsis ||
                                "No synopsis available."}
                        </p>
                    </div>

                    <ReviewSection animeId={id} />
                </div>
            </div>
        </PageContainer>
    );
}

export default Detail;
