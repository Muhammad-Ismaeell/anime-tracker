import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewAPI } from "../../api/review.api";
import toast from "react-hot-toast";
// --------------------
// REVIEWS LIST
// --------------------
export function useReviews(animeId) {
    return useQuery({
        queryKey: ["reviews", animeId],
        queryFn: () => ReviewAPI.list(animeId),
        enabled: !!animeId,
    });
}

// --------------------
// CREATE REVIEW
// --------------------
export function useCreateReview() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ReviewAPI.create,

        onSuccess: (_, variables) => {
            toast.success("Review saved!");
            queryClient.invalidateQueries({
                queryKey: ["reviews", variables.anime_id]
            });

            queryClient.invalidateQueries({
                queryKey: ["user-reviews"]
            });

            queryClient.invalidateQueries({
                queryKey: ["review-analytics"]
            });

            queryClient.invalidateQueries({
                queryKey: ["top-rated-anime"]
            });
        },

        onError: () => {
            toast.error("Failed to save review");
        }

    });
}

// --------------------
// DELETE REVIEW
// --------------------
export function useDeleteReview() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ReviewAPI.delete,

        onSuccess: (_, animeId) => {

            queryClient.invalidateQueries({
                queryKey: ["reviews", animeId]
            });

            queryClient.invalidateQueries({
                queryKey: ["user-reviews"]
            });

            queryClient.invalidateQueries({
                queryKey: ["review-analytics"]
            });

            queryClient.invalidateQueries({
                queryKey: ["top-rated-anime"]
            });
            toast.success("Review deleted!");
        }
    });
}

// --------------------
// USER REVIEWS
// --------------------
export function useUserReviews() {

    return useQuery({
        queryKey: ["user-reviews"],
        queryFn: ReviewAPI.myReviews,
    });
}

// --------------------
// ANALYTICS
// --------------------
export function useReviewAnalytics() {

    return useQuery({
        queryKey: ["review-analytics"],
        queryFn: ReviewAPI.analytics,
    });
}

// --------------------
// TOP RATED
// --------------------
export function useTopRatedAnime() {

    return useQuery({
        queryKey: ["top-rated-anime"],

        queryFn: ReviewAPI.topRated,

        select: (data) => data ?? [],
    });
}

export function useUpdateReview() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ reviewId, payload }) =>
            ReviewAPI.update(reviewId, payload),

        onSuccess: () => {

            queryClient.invalidateQueries(["user-reviews"]);
            queryClient.invalidateQueries(["reviews"]);
            queryClient.invalidateQueries(["review-analytics"]);
            queryClient.invalidateQueries(["top-rated-anime"]);
            toast.success("Review updated!");
        }
    });
}