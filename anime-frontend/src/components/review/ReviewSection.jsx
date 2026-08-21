import { useContext, useState } from "react";

import {
    useReviews,
    useCreateReview,
    useDeleteReview,
} from "../../hooks/user/useReview";

import { AuthContext } from "../../context/AuthContext";
import { useAuthPrompt } from "../../context/useAuthPrompt";

import EmptyState from "../ui/EmptyState";
import AnimeCardSkeleton from "../skeletons/AnimeCardSkeleton";


function ReviewSection({ animeId }) {
    const { user, isAuthenticated } =
        useContext(AuthContext);

    const { showLoginRequired } =
        useAuthPrompt();

    const {
        data,
        isLoading,
    } = useReviews(animeId);

    const createReview = useCreateReview();
    const deleteReview = useDeleteReview();

    const [rating, setRating] = useState(10);
    const [text, setText] = useState("");


    if (isLoading) {
        return (
            <div className="reviews-list">
                {Array.from({ length: 3 }).map(
                    (_, index) => (
                        <AnimeCardSkeleton
                            key={index}
                        />
                    )
                )}
            </div>
        );
    }


    const reviews = data?.reviews ?? [];
    const average = Number(data?.average_rating ?? 0);


    const requireAuthentication = () => {
        if (!isAuthenticated) {
            showLoginRequired();
            return false;
        }

        return true;
    };


    const submit = () => {
        if (!requireAuthentication()) {
            return;
        }

        const reviewText = text.trim();

        if (!reviewText) {
            return;
        }

        createReview.mutate(
            {
                anime_id: Number(animeId),
                rating,
                text: reviewText,
            },
            {
                onSuccess: () => {
                    setText("");
                },
            }
        );
    };


    return (
        <section className="reviews-section">

            <div className="reviews-header">
                <h2>⭐ Community Reviews</h2>

                <div className="average-rating">
                    {average.toFixed(1)} / 10
                </div>
            </div>


            <div className="review-form">

                <select
                    value={rating}
                    onChange={(event) => {
                        if (!requireAuthentication()) {
                            return;
                        }

                        setRating(
                            Number(event.target.value)
                        );
                    }}
                    aria-label="Review rating"
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                        (value) => (
                            <option
                                key={value}
                                value={value}
                            >
                                {value}/10
                            </option>
                        )
                    )}
                </select>


                <textarea
                    value={text}
                    onChange={(event) => {
                        if (!isAuthenticated) {
                            showLoginRequired();
                            return;
                        }

                        setText(event.target.value);
                    }}
                    onFocus={() => {
                        if (!isAuthenticated) {
                            showLoginRequired();
                        }
                    }}
                    placeholder={
                        isAuthenticated
                            ? "Share your thoughts..."
                            : "Sign in to write a review..."
                    }
                    readOnly={!isAuthenticated}
                    aria-label="Review text"
                />


                <button
                    type="button"
                    onClick={submit}
                    disabled={
                        isAuthenticated &&
                        createReview.isPending
                    }
                >
                    {isAuthenticated &&
                    createReview.isPending
                        ? "Posting..."
                        : "Submit Review"}
                </button>

            </div>


            <div className="reviews-list">

                {reviews.length === 0 ? (
                    <EmptyState
                        text="No reviews yet."
                    />
                ) : (
                    reviews.map((review) => {
                        const isOwnReview =
                            isAuthenticated &&
                            String(user?.id) === String(review.user_id);

                        return (
                            <article
                                key={review.id}
                                className="review-card"
                            >
                                <div className="review-top">
                                    <strong>
                                        {review.username}
                                    </strong>

                                    <span>
                                        ⭐ {review.rating}/10
                                    </span>
                                </div>

                                <p>{review.text}</p>

                                <small>
                                    {new Date(
                                        review.created_at
                                    ).toLocaleDateString()}
                                </small>

                                {isOwnReview && (
                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    "Delete your review?"
                                                )
                                            ) {
                                                deleteReview.mutate(
                                                    review.id
                                                );
                                            }
                                        }}
                                    >
                                        Delete my review
                                    </button>
                                )}
                            </article>
                        );
                    })
                )}

            </div>
        </section>
    );
}

export default ReviewSection;