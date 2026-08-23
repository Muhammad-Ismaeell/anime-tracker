import { useContext, useEffect } from "react";
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
    useToggleFavorite
} from "../hooks/user/useFavorites";
import { Helmet } from "react-helmet-async";
import OptimizedImage from "../components/ui/OptimizedImage";

function Detail() {

    const { id } = useParams();
    const { isAuthenticated } =
        useContext(AuthContext);

    const { showLoginRequired } =
        useAuthPrompt();
    const {
        data: anime,
        isLoading,
        isError,
        refetch
    } = useAnimeDetail(id);

    const {
        data: favoritesPage
    } = useFavorites();
    const toggleFavorite = useToggleFavorite();

    const favorites =
        favoritesPage?.results ?? [];

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

    const liked = favorites.some((favorite) => {
        const favoriteAnimeId =
            favorite.anime?.mal_id ??
            favorite.anime?.id ??
            favorite.anime_id ??
            favorite.mal_id;

        return (
            favoriteAnimeId != null &&
            String(favoriteAnimeId) === String(anime.id)
        );
    });

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

    return (
        <PageContainer>
            <Helmet>
                <title>{anime.title} | Anime Tracker</title>

                <meta
                    name="description"
                    content={anime.synopsis || `Read about ${anime.title}.`}
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
                    </div>

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