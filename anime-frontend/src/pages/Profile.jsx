import PageContainer from "../components/ui/PageContainer";
import { useProfile } from "../hooks/user/useProfile";
import { useFavorites } from "../hooks/user/useFavorites";
import { useActivity } from "../hooks/user/useActivity";
import { getMediaUrl } from "../utils/mediaUrl";
import {
    useUserReviews,
    useReviewAnalytics,
    useTopRatedAnime,
    useCreateReview,
    useDeleteReview,
    useUpdateReview
} from "../hooks/user/useReview";
import OptimizedImage from "../components/ui/OptimizedImage";
import AnimeCard from "../components/AnimeCard";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import EmptyState from "../components/ui/EmptyState";
import AnimeCardSkeleton from "../components/skeletons/AnimeCardSkeleton";

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

    // ---------------- PROFILE ----------------
    const {
        data: profile,
        isLoading,
        isError,
        refetch
    } = useProfile();

    const user = profile?.user;
    const profileData = profile?.profile;

    // ---------------- FAVORITES ----------------
    const favoritesRes = useFavorites();
    const updateReview = useUpdateReview();
    const favorites =
        favoritesRes?.data?.results ??
        favoritesRes?.results ??
        [];

    // ---------------- ACTIVITY ----------------
    const {
        data: activityPages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useActivity();

    const activity = useMemo(() => {
        return activityPages?.pages?.flatMap(
            page => page?.results ?? []
        ) ?? [];
    }, [activityPages]);
    // ---------------- ANALYTICS ----------------
    const { data: analytics } = useReviewAnalytics();

    const reviewCount = analytics?.review_count ?? 0;
    const averageRating = analytics?.average_rating ?? 0;

    // ---------------- TOP RATED ----------------
   const { data: topRatedList = [] } = useTopRatedAnime();

    // ---------------- REVIEWS ----------------
    const { data: reviewsResponse } = useUserReviews();

    const myReviews =
        reviewsResponse?.results ??
        [];

    // ---------------- GLOBAL LIBRARY ----------------
    const { statusMap } = useGlobalLibrary();

    // ---------------- UI STATE ----------------
    const [editingReview, setEditingReview] = useState(null);
    const [rating, setRating] = useState(10);
    const [text, setText] = useState("");

    const saveReview = () => {

        if (!editingReview) return;

        updateReview.mutate({
            reviewId: editingReview.id,
            payload: {
                rating,
                text
            }
        });

        setEditingReview(null);
        setRating(10);
        setText("");
    };

    if (isLoading) {

        return (

            <PageContainer>

                <div className="grid">

                    {Array.from({length:8}).map((_,i)=>(
                        <AnimeCardSkeleton key={i}/>
                    ))}

                </div>

            </PageContainer>

        );

    }

    if (isError) {

        return (

            <PageContainer>

                <EmptyState
                    text="Couldn't load your profile."
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

    return (
        <PageContainer>

            {/* ---------------- HEADER ---------------- */}
            <div className="profile-hero">

                <div className="profile-avatar">
                    {profileData?.avatar ? (
                        <OptimizedImage
                            src={getMediaUrl(profileData.avatar)}
                            alt="avatar"
                        />
                    ) : (
                        <div className="avatar-placeholder">👤</div>
                    )}
                </div>

                <div className="profile-info">
                    <h1>{user?.username}</h1>

                    <p className="profile-bio">
                        {profileData?.bio || "Anime fan"}
                    </p>

                    <span className="profile-tag">
                        🎌 Anime Explorer
                    </span>
                </div>

                <button
                    className="edit-profile-btn"
                    onClick={() => navigate("/edit-profile")}
                >
                    ✏️ Edit Profile
                </button>
            </div>

            {/* ---------------- STATS ---------------- */}
            <div className="stats-grid premium">

                <div className="stat-card glass">
                    ❤️ <h3>{favorites.length}</h3>
                    <p>Favorites</p>
                </div>

                <div className="stat-card glass">
                    📝 <h3>{reviewCount}</h3>
                    <p>Reviews</p>
                </div>

                <div className="stat-card glass">
                    ⭐ <h3>{averageRating}</h3>
                    <p>Average Rating</p>
                </div>

            </div>

            {/* ---------------- FAVORITES ---------------- */}
            <section className="section">
                <h2>❤️ Favorite Anime</h2>

                <div className="anime-grid">

                    {favorites.length ? (
                        favorites.slice(0, 8).map(item => (
                            <AnimeCard
                                key={item.id}
                                anime={{
                                    mal_id: item.anime.id,
                                    title: item.anime.title,
                                    image: item.anime.image,
                                    score: item.anime.score,
                                }}
                                statusMap={statusMap}
                            />
                        ))
                    ) : (
                        <EmptyState text="No favorite anime yet" />
                    )}

                </div>
            </section>

            {/* ---------------- TOP RATED ---------------- */}
            <section className="section">
                <h2>🏆 Top Rated By You</h2>

                <div className="anime-grid">
                    
                    {topRatedList.length ? (
                        topRatedList.map(item => (
                            <AnimeCard
                                key={item.anime_id ?? item.id}
                                anime={{
                                    mal_id: item.anime_id,
                                    title: item.title,
                                    image: item.image,
                                    score: item.rating,
                                }}
                            />
                        ))
                    ) : (
                        <EmptyState text="No top rated anime yet" />
                    )}

                </div>
            </section>

            {/* ---------------- ACTIVITY ---------------- */}
            <section className="section">
                <h2>⚡ Recent Activity</h2>

                <div className="activity-list">

                    {activity.length ? (
                        activity.map(act => (
                            <div key={act.id} className="activity-item">

                                <OptimizedImage
                                    src={act.anime?.image}
                                    alt={act.anime?.title}
                                    className="activity-cover"
                                />

                                <div className="activity-content">

                                    <div className="activity-action">
                                        {actionLabels[act.action] ?? act.action}
                                    </div>

                                    <strong>{act.anime?.title}</strong>

                                    <small>
                                        {new Date(act.created_at).toLocaleDateString()}
                                    </small>

                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState text="No activity yet" />
                    )}

                </div>

                {hasNextPage && (
                    <button
                        className="load-more-btn"
                        disabled={isFetchingNextPage}
                        onClick={() => fetchNextPage()}
                    >
                        {isFetchingNextPage
                            ? "Loading..."
                            : "Load More Activity"}
                    </button>
                )}
            </section>

            {/* ---------------- REVIEWS ---------------- */}
            <section className="section">
                <h2>📝 My Reviews</h2>

                <div className="reviews-list">

                    {myReviews.length ? (
                        myReviews.map(review => (
                            <div key={review.id} className="review-card">

                                <div className="review-top">
                                    <strong>{review.anime_title}</strong>
                                    <span>⭐ {review.rating}/10</span>
                                </div>

                                <p>{review.text}</p>

                                <small>
                                    {new Date(review.created_at).toLocaleDateString()}
                                </small>

                                <button
                                    className="edit-btn"
                                    onClick={() => {
                                        setEditingReview(review);
                                        setRating(review.rating);
                                        setText(review.text);
                                    }}
                                >
                                    ✏️ Edit
                                </button>

                            </div>
                        ))
                    ) : (
                        <EmptyState text="No reviews yet" />
                    )}

                </div>
            </section>

            {/* ---------------- EDIT MODAL ---------------- */}
            {editingReview && (
                <div className="modal-overlay">

                    <div className="edit-review-modal">

                        <h3>Edit Review</h3>

                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                        >
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                <option key={n} value={n}>
                                    {n}/10
                                </option>
                            ))}
                        </select>

                        <textarea
                            rows={6}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        <div className="modal-actions">


                            <button
                                onClick={saveReview}
                                disabled={updateReview.isPending}
                            >
                                {updateReview.isPending
                                    ? "Saving..."
                                    : "Save"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </PageContainer>
    );
}

export default Profile;