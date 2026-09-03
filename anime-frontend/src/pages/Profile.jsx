
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
import {
    useUserReviews,
    useReviewAnalytics,
    useTopRatedAnime,
    useUpdateReview,
} from "../hooks/user/useReview";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

import { getMediaUrl } from "../utils/mediaUrl";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";

const getAnimeId = (anime) => {
    return (
        anime?.mal_id ??
        anime?.id ??
        anime?.anime_id ??
        null
    );
};


const getAnimeTitle = (anime) => {
    return (
        anime?.title ??
        "Unknown Anime"
    );
};


const getAnimeImage = (anime) => {
    return (
        anime?.image ??
        ""
    );
};


const normalizeAnime = (item, score = 0) => {
    const source = item?.anime ?? item;

    const id = getAnimeId(
        item?.anime
            ? item.anime
            : item
    );

    if (id == null) {
        return null;
    }

    return {
        id,
        title:
            getAnimeTitle(source),
        image:
            getAnimeImage(source),
        score:
            item?.rating ??
            source?.score ??
            score ??
            0,
    };
};


const formatDate = (date) => {
    if (!date) {
        return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return parsedDate.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );
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

    const {
        data: favoritesData,
        isLoading: favoritesLoading,
        isError: favoritesError,
        refetch: refetchFavorites,
    } = useFavorites();

    const favorites = useMemo(
        () =>
            favoritesData?.pages?.flatMap(
                (page) => page?.results ?? []
            ) ?? [],
        [favoritesData]
    );

    const favoriteIds = useFavoriteIds();


    const toggleFavorite =
        useToggleFavorite();


    // =========================================================
    // REVIEWS
    // =========================================================

    const {
        data: analytics,
        isLoading: analyticsLoading,
        isError: analyticsError,
    } = useReviewAnalytics();

    const {
        data: topRatedList = [],
        isLoading: topRatedLoading,
        isError: topRatedError,
        refetch: refetchTopRated,
    } = useTopRatedAnime();

    const {
        data: reviewsData,
        isLoading: reviewsLoading,
        isError: reviewsError,
        refetch: refetchReviews,
    } = useUserReviews();

    const updateReview =
        useUpdateReview();

    const myReviews =
        reviewsData?.results ?? [];

    const reviewCount =
        analytics?.review_count ?? 0;

    const averageRating =
        analytics?.average_rating ?? 0;


    // =========================================================
    // LIBRARY
    // =========================================================

    const {
        statusMap,
    } = useGlobalLibrary();


    // =========================================================
    // REVIEW EDITOR
    // =========================================================

    const [
        editingReview,
        setEditingReview,
    ] = useState(null);

    const [
        rating,
        setRating,
    ] = useState(10);

    const [
        text,
        setText,
    ] = useState("");


    // =========================================================
    // REVIEW ACTIONS
    // =========================================================

    const openReviewEditor = (review) => {

        if (!review) {
            return;
        }

        setEditingReview(review);

        setRating(
            Number(review.rating) || 10
        );

        setText(
            review.text ?? ""
        );
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

        const cleanText =
            text.trim();

        if (!cleanText) {
            return;
        }

        updateReview.mutate(
            {
                reviewId:
                    editingReview.id,

                payload: {
                    rating,
                    text: cleanText,
                },
            },
            {
                onSuccess:
                    closeReviewEditor,
            }
        );
    };


    // =========================================================
    // FAVORITE ACTION
    // =========================================================

    const handleToggleFavorite = (
        anime
    ) => {

        const animeId =
            getAnimeId(anime);

        if (animeId == null) {
            return;
        }

        toggleFavorite.mutate({
            anime_id: animeId,
            title:
                getAnimeTitle(anime),
            image:
                getAnimeImage(anime),
        });
    };


    // =========================================================
    // NAVIGATION
    // =========================================================

    const openAnime = (anime) => {

        const animeId =
            getAnimeId(anime);

        if (animeId == null) {
            return;
        }

        navigate(
            `/anime/${animeId}`
        );
    };


    // =========================================================
    // NORMALIZED FAVORITES
    // =========================================================

    const normalizedFavorites =
        useMemo(() => {

            return favorites
                .slice(0, 8)
                .map((item) =>
                    normalizeAnime(item)
                )
                .filter(Boolean);

        }, [favorites]);


    // =========================================================
    // NORMALIZED TOP RATED
    // =========================================================

    const normalizedTopRated =
        useMemo(() => {

            return topRatedList
                .map((item) =>
                    normalizeAnime(item)
                )
                .filter(Boolean);

        }, [topRatedList]);


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

                            <div
                                className="
                                    profile-skeleton-line
                                    profile-skeleton-name
                                "
                            />

                            <div
                                className="
                                    profile-skeleton-line
                                    profile-skeleton-bio
                                "
                            />

                            <div className="profile-skeleton-tag" />

                        </div>

                        <div className="profile-skeleton-button" />

                    </div>


                    <div className="profile-skeleton-stats">

                        {Array.from({
                            length: 3,
                        }).map((_, index) => (

                            <div
                                key={index}
                                className="profile-skeleton-stat"
                            />

                        ))}

                    </div>


                    <section className="section">

                        <div className="profile-skeleton-heading" />

                        <div className="grid">

                            {Array.from({
                                length: 4,
                            }).map((_, index) => (

                                <AnimeCardSkeleton
                                    key={index}
                                />

                            ))}

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
                            src={getMediaUrl(
                                profileData.avatar
                            )}
                            alt={`${user?.username ?? "User"} avatar`}
                        />

                    ) : (

                        <div
                            className="avatar-placeholder"
                            aria-hidden="true"
                        >
                            👤
                        </div>

                    )}

                </div>


                <div className="profile-info">

                    <h1>
                        {user?.username ??
                            "Anime Fan"}
                    </h1>

                    <p className="profile-bio">
                        {profileData?.bio ||
                            "Anime fan"}
                    </p>

                    <span className="profile-tag">
                        🎌 Anime Explorer
                    </span>

                </div>


                <button
                    type="button"
                    className="edit-profile-btn"
                    onClick={() =>
                        navigate(
                            "/edit-profile"
                        )
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

                    <span aria-hidden="true">
                        ❤️
                    </span>

                    <h3>
                        {favoriteIds.size}
                    </h3>

                    <p>
                        Favorites
                    </p>

                </div>


                <div className="stat-card glass">

                    <span aria-hidden="true">
                        📝
                    </span>

                    <h3>
                        {analyticsLoading
                            ? "..."
                            : analyticsError
                                ? "—"
                                : reviewCount}
                    </h3>

                    <p>
                        Reviews
                    </p>

                </div>


                <div className="stat-card glass">

                    <span aria-hidden="true">
                        ⭐
                    </span>

                    <h3>
                        {analyticsLoading
                            ? "..."
                            : analyticsError
                                ? "—"
                                : averageRating}
                    </h3>

                    <p>
                        Average Rating
                    </p>

                </div>

            </div>


            {/* =================================================
                FAVORITES
            ================================================= */}

            <section className="section">

                <h2>
                    ❤️ Favorite Anime
                </h2>


                <div className="anime-grid">

                    {favoritesLoading ? (

                        Array.from({ length: 4 }).map(
                            (_, index) => (
                                <AnimeCardSkeleton
                                    key={index}
                                />
                            )
                        )

                    ) : favoritesError ? (

                        <div className="profile-section-error">
                            <EmptyState
                                text="Couldn't load your favorites."
                            />

                            <button
                                type="button"
                                className="retry-btn"
                                onClick={refetchFavorites}
                            >
                                Retry
                            </button>
                        </div>

                    ) : normalizedFavorites.length > 0 ? (

                        normalizedFavorites.map(
                            (anime) => {
                                const id = String(
                                    anime.id
                                );

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
                                            handleToggleFavorite(
                                                anime
                                            )
                                        }
                                    />
                                );
                            }
                        )

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

                <h2>
                    🏆 Top Rated By You
                </h2>


                <div className="anime-grid">

                    {topRatedLoading ? (

                        Array.from({ length: 4 }).map(
                            (_, index) => (
                                <AnimeCardSkeleton
                                    key={index}
                                />
                            )
                        )

                    ) : topRatedError ? (

                        <div className="profile-section-error">
                            <EmptyState
                                text="Couldn't load your top rated anime."
                            />

                            <button
                                type="button"
                                className="retry-btn"
                                onClick={refetchTopRated}
                            >
                                Retry
                            </button>
                        </div>

                    ) : normalizedTopRated.length > 0 ? (

                        normalizedTopRated.map(
                            (anime) => {

                                const id =
                                    String(
                                        anime.id
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
                                            handleToggleFavorite(
                                                anime
                                            )
                                        }
                                    />
                                );
                            }
                        )

                    ) : (

                        <EmptyState
                            text="No top rated anime yet"
                        />

                    )}

                </div>

            </section>


            {/* =================================================
                MY REVIEWS
            ================================================= */}

            <section className="section">

                <div className="section-header">

                    <h2>
                        📝 My Reviews
                    </h2>

                </div>


                <div className="reviews-list">

                    {reviewsLoading ? (

                        <div className="reviews-loading">
                            <p>Loading reviews...</p>
                        </div>

                    ) : reviewsError ? (

                        <div className="profile-section-error">
                            <EmptyState
                                text="Couldn't load your reviews."
                            />

                            <button
                                type="button"
                                className="retry-btn"
                                onClick={refetchReviews}
                            >
                                Retry
                            </button>
                        </div>

                    ) : myReviews.length > 0 ? (

                        myReviews.map(
                            (review) => {

                                const anime =
                                    review?.anime;

                                const animeId =
                                    getAnimeId(
                                        anime
                                    );

                                return (
                                    <article
                                        key={review.id}
                                        className="
                                            review-card
                                            profile-review-card
                                        "
                                    >

                                        <div className="profile-review-anime">

                                            {anime?.image ? (

                                                <OptimizedImage
                                                    src={
                                                        anime.image
                                                    }
                                                    alt={
                                                        anime.title ||
                                                        "Anime"
                                                    }
                                                    className="
                                                        profile-review-anime-image
                                                    "
                                                />

                                            ) : (

                                                <div
                                                    className="
                                                        profile-review-anime-image
                                                        profile-review-image-fallback
                                                    "
                                                    aria-hidden="true"
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
                                                        className="
                                                            profile-review-anime-link
                                                        "
                                                        onClick={() =>
                                                            openAnime(
                                                                anime
                                                            )
                                                        }
                                                    >
                                                        View Anime
                                                    </button>

                                                )}

                                            </div>


                                            <span className="review-rating">

                                                ⭐{" "}
                                                {review.rating}
                                                /10

                                            </span>

                                        </div>


                                        <p className="review-text">
                                            {review.text}
                                        </p>


                                        <div className="review-footer">

                                            <time
                                                dateTime={
                                                    review.created_at
                                                }
                                            >
                                                {formatDate(
                                                    review.created_at
                                                )}
                                            </time>


                                            <button
                                                type="button"
                                                className="edit-btn"
                                                onClick={() =>
                                                    openReviewEditor(
                                                        review
                                                    )
                                                }
                                            >
                                                ✏️ Edit
                                            </button>

                                        </div>

                                    </article>
                                );
                            }
                        )

                    ) : (

                        <EmptyState
                            text="No reviews yet"
                        />

                    )}

                </div>

            </section>


            {/* =================================================
                EDIT REVIEW MODAL
            ================================================= */}

            {editingReview && (

                <div
                    className="
                        profile-review-modal-overlay
                    "
                    onClick={closeReviewEditor}
                    role="presentation"
                >

                    <div
                        className="
                            profile-review-modal
                        "
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="
                            profile-review-modal-title
                        "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div
                            className="
                                profile-review-modal-header
                            "
                        >

                            <div
                                className="
                                    profile-review-anime-edit
                                "
                            >

                                {editingReview?.anime?.image ? (

                                    <OptimizedImage
                                        src={
                                            editingReview.anime.image
                                        }
                                        alt={
                                            editingReview.anime.title ||
                                            "Anime"
                                        }
                                        className="
                                            profile-review-anime-edit-image
                                        "
                                    />

                                ) : (

                                    <div
                                        className="
                                            profile-review-anime-edit-image
                                            profile-review-image-fallback
                                        "
                                        aria-hidden="true"
                                    >
                                        🎬
                                    </div>

                                )}


                                <div>

                                    <span
                                        className="
                                            profile-review-modal-eyebrow
                                        "
                                    >
                                        YOUR REVIEW
                                    </span>

                                    <h3
                                        id="
                                            profile-review-modal-title
                                        "
                                    >
                                        Edit Review
                                    </h3>

                                    <p>
                                        {editingReview?.anime?.title ||
                                            "Unknown Anime"}
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="
                                    profile-review-modal-close
                                "
                                onClick={
                                    closeReviewEditor
                                }
                                disabled={
                                    updateReview.isPending
                                }
                                aria-label="
                                    Close review editor
                                "
                            >
                                ✕
                            </button>

                        </div>


                        {/* RATING */}

                        <div className="profile-review-field">

                            <label
                                htmlFor="
                                    profile-review-rating
                                "
                            >
                                Rating
                            </label>

                            <select
                                id="
                                    profile-review-rating
                                "
                                value={rating}
                                onChange={(event) =>
                                    setRating(
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                                disabled={
                                    updateReview.isPending
                                }
                            >

                                {Array.from(
                                    {
                                        length: 10,
                                    },
                                    (_, index) =>
                                        index + 1
                                ).map((value) => (

                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {value}/10
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* REVIEW TEXT */}

                        <div className="profile-review-field">

                            <label
                                htmlFor="
                                    profile-review-text
                                "
                            >
                                Review
                            </label>

                            <textarea
                                id="
                                    profile-review-text
                                "
                                rows={7}
                                value={text}
                                onChange={(event) =>
                                    setText(
                                        event.target.value
                                    )
                                }
                                placeholder="
                                    Write your thoughts about this anime...
                                "
                                disabled={
                                    updateReview.isPending
                                }
                            />

                        </div>


                        {/* ACTIONS */}

                        <div
                            className="
                                profile-review-modal-actions
                            "
                        >

                            <button
                                type="button"
                                className="
                                    profile-review-cancel
                                "
                                onClick={
                                    closeReviewEditor
                                }
                                disabled={
                                    updateReview.isPending
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="
                                    profile-review-save
                                "
                                onClick={
                                    saveReview
                                }
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
