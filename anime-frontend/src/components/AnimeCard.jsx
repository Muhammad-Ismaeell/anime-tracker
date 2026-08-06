import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { memo, useState } from "react";
import { useToggleFavorite } from "../hooks/user/useFavorites";
import { useUpdateLibrary } from "../hooks/useLibrary";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";
import OptimizedImage from "./ui/OptimizedImage";

function AnimeCard({ anime, statusMap = new Map() }) {

    const navigate = useNavigate();
    const updateLibrary = useUpdateLibrary();
    const toggleFavorite = useToggleFavorite();

    const favoriteIds = useFavoriteIds();

    const [open, setOpen] = useState(false);

    const animeId = String(anime?.mal_id || anime?.id || anime?.anime_id);
    const status = statusMap.get(animeId);
    const handleUpdate = (value) => {
        setOpen(false);

        if (value === "remove") {
            updateLibrary.mutate({
                anime_id: animeId,
                remove: true
            });
            return;
        }

        updateLibrary.mutate({
            anime_id: animeId,
            status:value,
            title: anime.title,
            image:
                anime.image ||
                anime.images?.jpg?.image_url
        })
    };

    return (
        <motion.div
            className="anime-card"
            whileHover={{ scale: 1.03 }}
        >

            {/* IMAGE */}
            <div
                className="imageWrapper"
                onClick={() => navigate(`/anime/${animeId}`)}
            >
                <OptimizedImage
                    src={
                        anime.image ||
                        anime.anime?.image ||
                        anime.images?.jpg?.image_url
                    }
                    alt={
                        anime.title ||
                        anime.anime?.title ||
                        "Unknown Anime"
                    }
                    className="image"
                />
            </div>

            {/* FAVORITE */}
            <button
                className="favIcon"
                disabled={toggleFavorite.isPending}
                onClick={(e) => {

                    e.stopPropagation();

                    toggleFavorite.mutate({
                        anime_id: animeId,
                        title: anime.title,
                        image:
                            anime.image ||
                            anime.images?.jpg?.image_url ||
                            ""
                    });
                }}
            >
                {toggleFavorite.isPending
                    ? "⏳"
                    : favoriteIds.has(animeId)
                        ? "❤️"
                        : "🤍"}
            </button>

            {/* TITLE */}
            <div className="content">
                <h3 className="title">
                    {anime.title || anime.anime?.title || "Unknown"}
                </h3>

                {/* STATUS */}
                <div
                    className="status-wrapper"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(!open);
                    }}
                >

                    <div className={`status-badge ${status || "none"}`}>
                        {updateLibrary.isPending
                            ? "Updating..."
                            : status 
                                ? status.replaceAll("_"," ")
                                : "Add to list"
                        }
                    </div>

                    {open && (
                        <div className="status-menu">

                            <div 
                                onClick={() => !updateLibrary.isPending && handleUpdate("watching")}
                            >
                                📺 Watching
                            </div>

                            <div 
                                onClick={() => !updateLibrary.isPending && handleUpdate("completed")}
                            >
                                ✅ Completed
                            </div>

                            <div 
                                onClick={() => !updateLibrary.isPending && handleUpdate("dropped")}
                            >
                                ❌ Dropped
                            </div>

                            <div 
                                onClick={() => !updateLibrary.isPending && handleUpdate("plan_to_watch")}
                            >
                                📌 Plan to Watch
                            </div>

                            <div
                                className="danger"
                                onClick={() => !updateLibrary.isPending && handleUpdate("remove")}
                            >
                                🗑 Remove from library
                            </div>

                        </div>
                    )}

                </div>
            </div>

        </motion.div>
    );
}

export default memo(AnimeCard);