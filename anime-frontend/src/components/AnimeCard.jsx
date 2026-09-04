import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { memo, useContext, useEffect, useRef, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import { useAuthPrompt } from "../context/useAuthPrompt";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";
import { useUpdateLibrary } from "../hooks/useLibrary";

import OptimizedImage from "./ui/OptimizedImage";
import "./AnimeCardAniList.css";

function AnimeCardImage({
    src,
    alt,
    className,
    imageLoading = "lazy",
    imageFetchPriority = "auto",
}) {
    const containerRef = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(
        () => typeof IntersectionObserver === "undefined"
    );

    useEffect(() => {
        const element = containerRef.current;

        if (!element) {
            return undefined;
        }


        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "150px" }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="anime-card-image-loader">
            {shouldLoad && (
                <OptimizedImage
                    src={src}
                    alt={alt}
                    className={className}
                    loading={imageLoading === "lazy" ? "eager" : imageLoading}
                    fetchPriority={imageFetchPriority}
                />
            )}
        </div>
    );
}

function AnimeCard({
    anime,
    statusMap = new Map(),
    isFavorited = false,
    onToggleFavorite,
    isFavoritePending = false,
    imageLoading = "lazy",
    imageFetchPriority = "auto",
}) {
    const { isAuthenticated } = useContext(AuthContext);
    const { showLoginRequired } = useAuthPrompt();
    const updateLibrary = useUpdateLibrary();
    const { libraryMap } = useGlobalLibrary();
    const favoriteIds = useFavoriteIds();

    const [open, setOpen] = useState(false);
    const [showProgressInput, setShowProgressInput] = useState(false);
    const [progress, setProgress] = useState(0);

    const rawAnimeId = anime?.mal_id ?? anime?.id ?? anime?.anime_id;

    if (rawAnimeId == null) {
        return null;
    }

    const animeId = String(rawAnimeId);
    const title = anime?.title || "Unknown Anime";
    const image = anime?.image || "";
    const score = Number(anime?.score) || 0;
    const type = anime?.type || "";
    const year = anime?.year || "";
    const episodeCount = Number(anime?.episodes) || 0;

    const status =
        statusMap instanceof Map ? statusMap.get(animeId) : undefined;

    const libraryItem =
        libraryMap instanceof Map ? libraryMap.get(animeId) : undefined;

    const currentProgress =
        Number(libraryItem?.progress ?? anime?.progress ?? 0) || 0;

    const favoriteState = isFavorited || favoriteIds.has(animeId);

    const handleFavoriteClick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isAuthenticated) {
            showLoginRequired();
            return;
        }

        onToggleFavorite?.({
            anime_id: animeId,
            title,
            image,
        });
    };

    const handleLibraryClick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isAuthenticated) {
            showLoginRequired();
            return;
        }

        setOpen((current) => !current);
        setShowProgressInput(false);
    };

    const handleUpdate = (value) => {
        if (!isAuthenticated) {
            setOpen(false);
            showLoginRequired();
            return;
        }

        if (value === "watching") {
            setProgress(currentProgress);
            setShowProgressInput(true);
            return;
        }

        if (value === "remove") {
            setOpen(false);
            setShowProgressInput(false);
            updateLibrary.mutate({
                anime_id: animeId,
                remove: true,
            });
            return;
        }

        setOpen(false);
        setShowProgressInput(false);
        updateLibrary.mutate({
            anime_id: animeId,
            status: value,
            title,
            image,
        });
    };

    const handleWatchingSubmit = () => {
        let safeProgress = Number(progress);

        if (!Number.isFinite(safeProgress)) {
            safeProgress = 0;
        }

        safeProgress = Math.max(0, Math.floor(safeProgress));

        if (episodeCount > 0) {
            safeProgress = Math.min(safeProgress, episodeCount);
        }

        setOpen(false);
        setShowProgressInput(false);

        updateLibrary.mutate({
            anime_id: animeId,
            status: "watching",
            progress: safeProgress,
            title,
            image,
        });
    };

    return (
        <motion.article
            className={`anime-card ${open ? "menu-open" : ""}`}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
        >
            <div className="anime-card-poster">
                <Link
                    to={`/anime/${animeId}`}
                    className="imageWrapper"
                    aria-label={`View ${title}`}
                >
                    <AnimeCardImage
                        src={image}
                        alt={title}
                        className="image"
                        imageLoading={imageLoading}
                        imageFetchPriority={imageFetchPriority}
                    />
                </Link>

                {score > 0 && (
                    <span className="anime-card-score">
                        ⭐ {score.toFixed(1)}
                    </span>
                )}

                <button
                    type="button"
                    className={`favIcon ${favoriteState ? "active" : ""}`}
                    disabled={
                        isAuthenticated &&
                        (!onToggleFavorite || isFavoritePending)
                    }
                    aria-label={
                        favoriteState
                            ? `Remove ${title} from favorites`
                            : `Add ${title} to favorites`
                    }
                    onClick={handleFavoriteClick}
                >
                    {isFavoritePending
                        ? "⏳"
                        : favoriteState
                            ? "❤️"
                            : "🤍"}
                </button>
            </div>

            <div className="content">
                <Link
                    to={`/anime/${animeId}`}
                    className="anime-card-title-link"
                >
                    <h3 className="title">{title}</h3>
                </Link>

                {(type || year) && (
                    <div className="anime-card-meta">
                        {type && <span>{type}</span>}
                        {year && <span>{year}</span>}
                    </div>
                )}

                <div className="status-wrapper">
                    <button
                        type="button"
                        className={`status-badge ${status || "none"}`}
                        onClick={handleLibraryClick}
                        disabled={
                            isAuthenticated && updateLibrary.isPending
                        }
                    >
                        {isAuthenticated && updateLibrary.isPending
                            ? "Updating..."
                            : status
                                ? status.replaceAll("_", " ")
                                : "＋ Add to list"}
                    </button>

                    {open && isAuthenticated && (
                        <div className="status-menu" role="menu">
                            {!showProgressInput ? (
                                <>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleUpdate("watching")}
                                        disabled={updateLibrary.isPending}
                                    >
                                        📺 Watching
                                    </button>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleUpdate("completed")}
                                        disabled={updateLibrary.isPending}
                                    >
                                        ✅ Completed
                                    </button>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleUpdate("dropped")}
                                        disabled={updateLibrary.isPending}
                                    >
                                        ❌ Dropped
                                    </button>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleUpdate("plan_to_watch")}
                                        disabled={updateLibrary.isPending}
                                    >
                                        📌 Plan to Watch
                                    </button>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="danger"
                                        onClick={() => handleUpdate("remove")}
                                        disabled={updateLibrary.isPending}
                                    >
                                        🗑 Remove from library
                                    </button>
                                </>
                            ) : (
                                <div
                                    className="progress-input-menu"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <label htmlFor={`progress-${animeId}`}>
                                        Episodes watched
                                    </label>
                                    <input
                                        id={`progress-${animeId}`}
                                        type="number"
                                        min="0"
                                        max={
                                            episodeCount > 0
                                                ? episodeCount
                                                : undefined
                                        }
                                        value={progress}
                                        onChange={(event) =>
                                            setProgress(event.target.value)
                                        }
                                        autoFocus
                                    />

                                    {episodeCount > 0 && (
                                        <small>
                                            out of {episodeCount} episodes
                                        </small>
                                    )}

                                    <div className="progress-input-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowProgressInput(false)
                                            }
                                            disabled={updateLibrary.isPending}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleWatchingSubmit}
                                            disabled={updateLibrary.isPending}
                                        >
                                            {updateLibrary.isPending
                                                ? "Saving..."
                                                : "Save"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

export default memo(AnimeCard);