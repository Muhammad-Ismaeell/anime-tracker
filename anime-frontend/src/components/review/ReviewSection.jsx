import { useState } from "react";
import {
    useReviews,
    useCreateReview,
    useDeleteReview
} from "../../hooks/user/useReview";
import EmptyState from "../ui/EmptyState";
import AnimeCardSkeleton from "../skeletons/AnimeCardSkeleton";

function ReviewSection({ animeId }) {

    const { data, isLoading } = useReviews(animeId);
    const createReview = useCreateReview();
    const deleteReview = useDeleteReview();

    const [rating, setRating] = useState(10);
    const [text, setText] = useState("");

    if (isLoading) {
        return (
            <div className="reviews-list">
                {Array.from({ length: 3 }).map((_, i) => (
                    <AnimeCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    const reviews = data?.reviews || [];
    const average = data?.average || 0;

    const submit = () => {
        if (!text.trim()) return;

        createReview.mutate({
            anime_id: Number(animeId),
            rating,
            text
        });

        setText("");
    };

    return (
        <div className="reviews-section">

            {/* HEADER */}
            <div className="reviews-header">
                <h2>⭐ Community Reviews</h2>
                <div className="average-rating">
                    {average.toFixed(1)} / 10
                </div>
            </div>

            {/* FORM */}
            <div className="review-form">

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
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your thoughts..."
                />

                <button
                    onClick={submit}
                    disabled={createReview.isPending}
                >
                    {createReview.isPending ? "Posting..." : "Submit Review"}
                </button>

            </div>

            {/* LIST */}
            <div className="reviews-list">

                {reviews.length === 0 ? (
                    <EmptyState text="No reviews yet." />
                ) : (
                    reviews.map(r => (
                        <div key={r.id} className="review-card">

                            <div className="review-top">
                                <strong>{r.username}</strong>
                                <span>⭐ {r.rating}/10</span>
                            </div>

                            <p>{r.text}</p>

                            <small>
                                {new Date(r.created_at).toLocaleDateString()}
                            </small>

                            <button
                                className="delete-btn"
                                onClick={() => {
                                    if (confirm("Delete your review?")) {
                                        deleteReview.mutate(r.id);
                                    }
                                }}
                            >
                                Delete my review
                            </button>

                        </div>
                    ))
                )}

            </div>
        </div>
    );
}

export default ReviewSection;