import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { memo, useContext, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import { useAuthPrompt } from "../context/useAuthPrompt";

import { useUpdateLibrary } from "../hooks/useLibrary";
import OptimizedImage from "./ui/OptimizedImage";


function AnimeCard({
    anime,
    statusMap = new Map(),
    isFavorited = false,
    onToggleFavorite,
    isFavoritePending = false,
}) {
    const { isAuthenticated } = useContext(AuthContext);
    const { showLoginRequired } = useAuthPrompt();

    const updateLibrary = useUpdateLibrary();

    const [open, setOpen] = useState(false);

    const animeId = String(
        anime?.mal_id ??
        anime?.id ??
        anime?.anime_id
    );

    const status = statusMap.get(animeId);

    const title = anime?.title || "Unknown Anime";
    const image = anime?.image || "";


    const handleFavoriteClick = (event) => {
        event.stopPropagation();

        if (!isAuthenticated) {
            showLoginRequired();
            return;
        }

        onToggleFavorite?.(anime);
    };


    const handleLibraryClick = () => {
        if (!isAuthenticated) {
            showLoginRequired();
            return;
        }

        setOpen((current) => !current);
    };


    const handleUpdate = (value) => {
        if (!isAuthenticated) {
            setOpen(false);
            showLoginRequired();
            return;
        }

        setOpen(false);

        if (value === "remove") {
            updateLibrary.mutate({
                anime_id: animeId,
                remove: true,
            });

            return;
        }

        updateLibrary.mutate({
            anime_id: animeId,
            status: value,
            title,
            image,
        });
    };


    return (
        <motion.article
            className={`anime-card ${
                open ? "menu-open" : ""
            }`}
            whileHover={{ scale: 1.03 }}
        >
            {/* IMAGE */}
            <Link
                to={`/anime/${animeId}`}
                className="imageWrapper"
                aria-label={`View ${title}`}
            >
                <OptimizedImage
                    src={image}
                    alt={title}
                    className="image"
                />
            </Link>


            {/* FAVORITE */}
            <button
                type="button"
                className={`favIcon ${
                    isFavorited ? "active" : ""
                }`}
                disabled={
                    isAuthenticated &&
                    (!onToggleFavorite ||
                        isFavoritePending)
                }
                aria-label={
                    isFavorited
                        ? `Remove ${title} from favorites`
                        : `Add ${title} to favorites`
                }
                onClick={handleFavoriteClick}
            >
                {isFavoritePending
                    ? "⏳"
                    : isFavorited
                        ? "❤️"
                        : "🤍"}
            </button>


            {/* CONTENT */}
            <div className="content">
                <h3 className="title">
                    {title}
                </h3>


                {/* LIBRARY STATUS */}
                <div className="status-wrapper">
                    <button
                        type="button"
                        className={`status-badge ${
                            status || "none"
                        }`}
                        onClick={handleLibraryClick}
                        disabled={
                            isAuthenticated &&
                            updateLibrary.isPending
                        }
                    >
                        {isAuthenticated &&
                        updateLibrary.isPending
                            ? "Updating..."
                            : status
                                ? status.replaceAll(
                                    "_",
                                    " "
                                )
                                : "Add to list"}
                    </button>


                    {open && isAuthenticated && (
                        <div className="status-menu">
                            <button
                                type="button"
                                onClick={() =>
                                    handleUpdate(
                                        "watching"
                                    )
                                }
                                disabled={
                                    updateLibrary.isPending
                                }
                            >
                                📺 Watching
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleUpdate(
                                        "completed"
                                    )
                                }
                                disabled={
                                    updateLibrary.isPending
                                }
                            >
                                ✅ Completed
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleUpdate(
                                        "dropped"
                                    )
                                }
                                disabled={
                                    updateLibrary.isPending
                                }
                            >
                                ❌ Dropped
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleUpdate(
                                        "plan_to_watch"
                                    )
                                }
                                disabled={
                                    updateLibrary.isPending
                                }
                            >
                                📌 Plan to Watch
                            </button>

                            <button
                                type="button"
                                className="danger"
                                onClick={() =>
                                    handleUpdate(
                                        "remove"
                                    )
                                }
                                disabled={
                                    updateLibrary.isPending
                                }
                            >
                                🗑 Remove from library
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

export default memo(AnimeCard);