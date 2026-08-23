import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { ReviewAPI } from "../../api/review.api";
import toast from "react-hot-toast";


/* =========================================================
   REVIEW QUERY KEYS
========================================================= */

const reviewKeys = {
    all: ["reviews"],

    anime: (animeId) => [
        "reviews",
        String(animeId),
    ],

    user: ["user-reviews"],

    analytics: ["review-analytics"],

    topRated: ["top-rated-anime"],
};


/* =========================================================
   REVIEWS LIST
========================================================= */

export function useReviews(animeId) {
    const normalizedAnimeId = String(animeId);

    return useQuery({
        queryKey: reviewKeys.anime(
            normalizedAnimeId
        ),

        queryFn: () =>
            ReviewAPI.list(
                normalizedAnimeId
            ),

        enabled: !!animeId,
    });
}


/* =========================================================
   CREATE REVIEW
========================================================= */

export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ReviewAPI.create,

        onSuccess: async (_, variables) => {
            const animeId = String(
                variables.anime_id
            );

            await queryClient.refetchQueries({
                queryKey: reviewKeys.anime(
                    animeId
                ),
                type: "active",
            });

            await queryClient.invalidateQueries({
                queryKey: reviewKeys.user,
            });

            await queryClient.invalidateQueries({
                queryKey: reviewKeys.analytics,
            });

            await queryClient.invalidateQueries({
                queryKey: reviewKeys.topRated,
            });

            toast.success("Review saved!");
        },

        onError: () => {
            toast.error(
                "Failed to save review"
            );
        },
    });
}


/* =========================================================
   DELETE REVIEW
========================================================= */

export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId }) =>
            ReviewAPI.delete(reviewId),

        onSuccess: async (_, variables) => {
            await queryClient.refetchQueries({
                queryKey: reviewKeys.anime(
                    variables.animeId
                ),
                type: "active",
            });

            await queryClient.invalidateQueries({
                queryKey: reviewKeys.user,
            });

            await queryClient.invalidateQueries({
                queryKey: reviewKeys.analytics,
            });

            await queryClient.invalidateQueries({
                queryKey: reviewKeys.topRated,
            });

            toast.success("Review deleted!");
        },

        onError: () => {
            toast.error("Failed to delete review");
        },
    });
}


/* =========================================================
   USER REVIEWS
========================================================= */

export function useUserReviews() {
    return useQuery({
        queryKey: reviewKeys.user,
        queryFn: ReviewAPI.myReviews,
    });
}


/* =========================================================
   REVIEW ANALYTICS
========================================================= */

export function useReviewAnalytics() {
    return useQuery({
        queryKey: reviewKeys.analytics,
        queryFn: ReviewAPI.analytics,
    });
}


/* =========================================================
   TOP RATED ANIME
========================================================= */

export function useTopRatedAnime() {
    return useQuery({
        queryKey: reviewKeys.topRated,

        queryFn: ReviewAPI.topRated,

        select: (data) => data ?? [],
    });
}


/* =========================================================
   UPDATE REVIEW
========================================================= */

export function useUpdateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            reviewId,
            payload,
        }) =>
            ReviewAPI.update(
                reviewId,
                payload
            ),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: reviewKeys.user,
            });

            await queryClient.invalidateQueries({
                queryKey: reviewKeys.all,
            });

            await queryClient.invalidateQueries({
                queryKey: reviewKeys.analytics,
            });

            await queryClient.invalidateQueries({
                queryKey: reviewKeys.topRated,
            });

            toast.success(
                "Review updated!"
            );
        },

        onError: () => {
            toast.error(
                "Failed to update review"
            );
        },
    });
}