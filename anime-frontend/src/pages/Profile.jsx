
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../components/ui/PageContainer";
import EmptyState from "../components/ui/EmptyState";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";
import OptimizedImage from "../components/ui/OptimizedImage";
import AnimeCard from "../components/AnimeCard";

import { useProfile } from "../hooks/useProfile";
import {
    useFavorites,
    useToggleFavorite,
} from "../hooks/user/useFavorites";
import { useActivity } from "../hooks/user/useActivity";
import {
    useUserReviews,
    useReviewAnalytics,
    useTopRatedAnime,
    useUpdateReview,
} from "../hooks/user/useReview";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import { getMediaUrl } from "../utils/mediaUrl";


const actionLabels = {
    FAVORITED: "❤️ Added to favorites",
    UNFAVORITED: "💔 Removed from favorites",
    WATCHING: "👀 Started watching",
    COMPLETED: "✅ Completed",
    DROPPED: "❌ Dropped",
    ADDED: "📚 Added to library",
    REMOVED: "🗑️ Removed from library",
};


function Profile() {
    const navigate = useNavigate();

    // =========================================================
    // PROFILE
    // =========================================================

    const {
        data: profile,
        isLoading: profileLoading,
        isError: profileError,
        refetch: refetchProfile,
    } = useProfile();

    const user = profile?.user;
    const profileData = profile?.profile;


    // =========================================================
    // FAVORITES
    // =========================================================

    const { data: favoritesData } = useFavorites();

    const favorites = useMemo(
        () => favoritesData?.results ?? [],
        [favoritesData?.results]
    );

    const favoriteIds = useMemo(() => {
        return new Set(
            favorites
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
    }, [favorites]);

    const toggleFavorite = useToggleFavorite();


    // =========================================================
    // ACTIVITY
    // =========================================================

    const {
        data: activityPages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useActivity();

    const activity = useMemo(
        () =>
            activityPages?.pages?.flatMap(
                (page) => page?.results ?? []
            ) ?? [],
        [activityPages]
    );


    // =========================================================
    // REVIEWS
    // =========================================================

    const { data: analytics } =
        useReviewAnalytics();

    const { data: topRatedList = [] } =
        useTopRatedAnime();

    const { data: reviewsData } =
        useUserReviews();

    const updateReview = useUpdateReview();

    const myReviews =
        reviewsData?.results ?? [];

    const reviewCount =
        analytics?.review_count ?? 0;

    const averageRating =
        analytics?.average_rating ?? 0;


    // =========================================================
    // LIBRARY
    // =========================================================

    const { statusMap } =
        useGlobalLibrary();


    // =========================================================
    // REVIEW EDITOR STATE
    // =========================================================

    const [editingReview, setEditingReview] =
        useState(null);

    const [rating, setRating] =
        useState(10);

    const [text, setText] =
        useState("");


    // =========================================================
    // REVIEW ACTIONS
    // =========================================================

    const openReviewEditor = (review) => {
        setEditingReview(review);
        setRating(review.rating);
        setText(review.text);
    };


    const closeReviewEditor = () => {
        if (updateReview.isPending) {
            return;
        }

        setEditingReview(null);
        setRating(10);
        setText("");
    };


    const saveReview = () => {
        if (!editingReview) {
            return;
        }

        const cleanText = text.trim();

        if (!cleanText) {
            return;
        }

        updateReview.mutate(
            {
                reviewId: editingReview.id,
                payload: {
                    rating,
                    text: cleanText,
                },
            },
            {
                onSuccess: closeReviewEditor,
            }
        );
    };


    // =========================================================
    // FAVORITE ACTION
    // =========================================================

    const handleToggleFavorite = (anime) => {
        const animeId =
            anime.id ??
            anime.mal_id;

        if (animeId == null) {
            return;
        }

        toggleFavorite.mutate({
            anime_id: animeId,
            title: anime.title,
            image: anime.image,
        });
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (profileLoading) {
        return (
            <PageContainer>
                <div className="profile-skeleton">

                    <div className="profile-skeleton-hero">
                        <div className="profile-skeleton-avatar" />

                        <div className="profile-skeleton-info">
                            <div className="profile-skeleton-line profile-skeleton-name" />
                            <div className="profile-skeleton-line profile-skeleton-bio" />
                            <div className="profile-skeleton-tag" />
                        </div>

                        <div className="profile-skeleton-button" />
                    </div>

                    <div className="profile-skeleton-stats">
                        {Array.from({ length: 3 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="profile-skeleton-stat"
                                />
                            )
                        )}
                    </div>

                    <section className="section">
                        <div className="profile-skeleton-heading" />

                        <div className="grid">
                            {Array.from({ length: 4 }).map(
                                (_, index) => (
                                    <AnimeCardSkeleton
                                        key={index}
                                    />
                                )
                            )}
                        </div>
                    </section>

                </div>
            </PageContainer>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (profileError) {
        return (
            <PageContainer>
                <EmptyState
                    text="Couldn't load your profile."
                />

                <button
                    type="button"
                    className="retry-btn"
                    onClick={refetchProfile}
                >
                    Retry
                </button>
            </PageContainer>
        );
    }


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <PageContainer>

            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <div className="profile-hero">

                <div className="profile-avatar">
                    {profileData?.avatar ? (
                        <OptimizedImage
                            src={getMediaUrl(profileData.avatar)}
                            alt="avatar"
                        />
                    ) : (
                        <div className="avatar-placeholder">
                            👤
                        </div>
                    )}
                </div>

                <div className="profile-info">
                    <h1>
                        {user?.username}
                    </h1>

                    <p className="profile-bio">
                        {profileData?.bio || "Anime fan"}
                    </p>

                    <span className="profile-tag">
                        🎌 Anime Explorer
                    </span>
                </div>

                <button
                    type="button"
                    className="edit-profile-btn"
                    onClick={() =>
                        navigate("/edit-profile")
                    }
                >
                    ✏️ Edit Profile
                </button>

            </div>


            {/* =================================================
                PROFILE STATS
            ================================================= */}

            <div className="stats-grid premium">

                <div className="stat-card glass">
                    ❤️
                    <h3>{favorites.length}</h3>
                    <p>Favorites</p>
                </div>

                <div className="stat-card glass">
                    📝
                    <h3>{reviewCount}</h3>
                    <p>Reviews</p>
                </div>

                <div className="stat-card glass">
                    ⭐
                    <h3>{averageRating}</h3>
                    <p>Average Rating</p>
                </div>

            </div>


            {/* =================================================
                FAVORITES
            ================================================= */}

            <section className="section">

                <h2>❤️ Favorite Anime</h2>

                <div className="anime-grid">

                    {favorites.length ? (
                        favorites
                            .slice(0, 8)
                            .map((item) => {

                                const animeId =
                                    item.anime?.mal_id ??
                                    item.anime?.id ??
                                    item.anime_id ??
                                    item.id;

                                if (animeId == null) {
                                    return null;
                                }

                                const id = String(animeId);

                                const anime = {
                                    id: animeId,
                                    title:
                                        item.anime?.title ??
                                        item.title ??
                                        "Unknown Anime",
                                    image:
                                        item.anime?.image ??
                                        item.image ??
                                        "",
                                    score:
                                        item.anime?.score ??
                                        item.score ??
                                        0,
                                };

                                return (
                                    <AnimeCard
                                        key={id}
                                        anime={anime}
                                        statusMap={statusMap}
                                        isFavorited={
                                            favoriteIds.has(id)
                                        }
                                        isFavoritePending={
                                            toggleFavorite.isPending
                                        }
                                        onToggleFavorite={() =>
                                            handleToggleFavorite(anime)
                                        }
                                    />
                                );
                            })
                    ) : (
                        <EmptyState
                            text="No favorite anime yet"
                        />
                    )}

                </div>

            </section>


            {/* =================================================
                TOP RATED
            ================================================= */}

            <section className="section">

                <h2>🏆 Top Rated By You</h2>

                <div className="anime-grid">

                    {topRatedList.length ? (
                        topRatedList.map((item) => {

                            const animeId =
                                item.anime_id ??
                                item.anime?.mal_id ??
                                item.anime?.id ??
                                item.id;

                            if (animeId == null) {
                                return null;
                            }

                            const id = String(animeId);

                            const anime = {
                                id: animeId,
                                title:
                                    item.title ??
                                    item.anime?.title ??
                                    "Unknown Anime",
                                image:
                                    item.image ??
                                    item.anime?.image ??
                                    "",
                                score:
                                    item.rating ??
                                    item.anime?.score ??
                                    0,
                            };

                            return (
                                <AnimeCard
                                    key={id}
                                    anime={anime}
                                    statusMap={statusMap}
                                    isFavorited={
                                        favoriteIds.has(id)
                                    }
                                    isFavoritePending={
                                        toggleFavorite.isPending
                                    }
                                    onToggleFavorite={() =>
                                        handleToggleFavorite(anime)
                                    }
                                />
                            );
                        })
                    ) : (
                        <EmptyState
                            text="No top rated anime yet"
                        />
                    )}

                </div>

            </section>


            {/* =================================================
                ACTIVITY
            ================================================= */}

            <section className="section">

                <div className="section-header">
                    <h2>⚡ Recent Activity</h2>
                </div>

                <div className="activity-list">

                    {activity.length ? (
                        activity.map((act) => (
                            <article
                                key={act.id}
                                className="activity-item"
                            >
                                <OptimizedImage
                                    src={act.anime?.image}
                                    alt={
                                        act.anime?.title ||
                                        "Anime"
                                    }
                                    className="activity-cover"
                                />

                                <div className="activity-content">

                                    <div className="activity-action">
                                        {actionLabels[act.action] ??
                                            act.action}
                                    </div>

                                    <strong>
                                        {act.anime?.title ||
                                            "Unknown Anime"}
                                    </strong>

                                    <time
                                        dateTime={act.created_at}
                                        className="activity-date"
                                    >
                                        {new Date(
                                            act.created_at
                                        ).toLocaleDateString(
                                            undefined,
                                            {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            }
                                        )}
                                    </time>

                                </div>
                            </article>
                        ))
                    ) : (
                        <EmptyState
                            text="No activity yet"
                        />
                    )}

                </div>

                {hasNextPage && (
                    <button
                        type="button"
                        className="load-more-btn"
                        disabled={isFetchingNextPage}
                        onClick={fetchNextPage}
                    >
                        {isFetchingNextPage
                            ? "Loading..."
                            : "Load More Activity"}
                    </button>
                )}

            </section>


            {/* =================================================
                MY REVIEWS
            ================================================= */}

            <section className="section">

                <div className="section-header">
                    <h2>📝 My Reviews</h2>
                </div>

                <div className="reviews-list">

                    {myReviews.length ? (
                        myReviews.map((review) => {

                            const anime = review.anime;

                            const animeId =
                                anime?.mal_id ??
                                anime?.id ??
                                anime?.anime_id;

                            return (
                                <article
                                    key={review.id}
                                    className="review-card profile-review-card"
                                >

                                    <div className="profile-review-anime">

                                        {anime?.image ? (
                                            <OptimizedImage
                                                src={anime.image}
                                                alt={
                                                    anime.title ||
                                                    "Anime"
                                                }
                                                className="profile-review-anime-image"
                                            />
                                        ) : (
                                            <div
                                                className="profile-review-anime-image profile-review-image-fallback"
                                                aria-label="No anime image available"
                                            >
                                                🎬
                                            </div>
                                        )}

                                        <div className="profile-review-anime-info">

                                            <strong>
                                                {anime?.title ||
                                                    "Unknown Anime"}
                                            </strong>

                                            {animeId != null && (
                                                <button
                                                    type="button"
                                                    className="profile-review-anime-link"
                                                    onClick={() =>
                                                        navigate(
                                                            `/anime/${animeId}`
                                                        )
                                                    }
                                                >
                                                    View Anime
                                                </button>
                                            )}

                                        </div>

                                        <span className="review-rating">
                                            ⭐ {review.rating}/10
                                        </span>

                                    </div>

                                    <p className="review-text">
                                        {review.text}
                                    </p>

                                    <div className="review-footer">

                                        <time
                                            dateTime={review.created_at}
                                        >
                                            {new Date(
                                                review.created_at
                                            ).toLocaleDateString(
                                                undefined,
                                                {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                }
                                            )}
                                        </time>

                                        <button
                                            type="button"
                                            className="edit-btn"
                                            onClick={() =>
                                                openReviewEditor(review)
                                            }
                                        >
                                            ✏️ Edit
                                        </button>

                                    </div>

                                </article>
                            );
                        })
                    ) : (
                        <EmptyState text="No reviews yet" />
                    )}

                </div>

            </section>


            {/* =================================================
                EDIT REVIEW MODAL
            ================================================= */}

            {editingReview && (
                <div
                    className="profile-review-modal-overlay"
                    onClick={closeReviewEditor}
                >

                    <div
                        className="profile-review-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="profile-review-modal-header">

                            <div className="profile-review-anime-edit">

                                {editingReview?.anime?.image ? (
                                    <OptimizedImage
                                        src={
                                            editingReview.anime.image
                                        }
                                        alt={
                                            editingReview.anime.title ||
                                            "Anime"
                                        }
                                        className="profile-review-anime-edit-image"
                                    />
                                ) : (
                                    <div
                                        className="profile-review-anime-edit-image profile-review-image-fallback"
                                        aria-label="No anime image available"
                                    >
                                        🎬
                                    </div>
                                )}

                                <div>

                                    <span className="profile-review-modal-eyebrow">
                                        YOUR REVIEW
                                    </span>

                                    <h3>Edit Review</h3>

                                    <p>
                                        {editingReview?.anime?.title ||
                                            "Unknown Anime"}
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                className="profile-review-modal-close"
                                onClick={closeReviewEditor}
                                aria-label="Close review editor"
                            >
                                ✕
                            </button>

                        </div>


                        <div className="profile-review-field">

                            <label htmlFor="profile-review-rating">
                                Rating
                            </label>

                            <select
                                id="profile-review-rating"
                                value={rating}
                                onChange={(event) =>
                                    setRating(
                                        Number(event.target.value)
                                    )
                                }
                            >
                                {[
                                    1, 2, 3, 4, 5,
                                    6, 7, 8, 9, 10,
                                ].map((value) => (
                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {value}/10
                                    </option>
                                ))}
                            </select>

                        </div>


                        <div className="profile-review-field">

                            <label htmlFor="profile-review-text">
                                Review
                            </label>

                            <textarea
                                id="profile-review-text"
                                rows={7}
                                value={text}
                                onChange={(event) =>
                                    setText(event.target.value)
                                }
                                placeholder="Write your thoughts about this anime..."
                            />

                        </div>


                        <div className="profile-review-modal-actions">

                            <button
                                type="button"
                                className="profile-review-cancel"
                                onClick={closeReviewEditor}
                                disabled={updateReview.isPending}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="profile-review-save"
                                onClick={saveReview}
                                disabled={
                                    updateReview.isPending ||
                                    !text.trim()
                                }
                            >
                                {updateReview.isPending
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </PageContainer>
    );
}


export default Profile;
