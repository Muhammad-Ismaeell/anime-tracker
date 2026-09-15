import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ReviewAPI } from "../../api/review.api";
import { queryKeys } from "../../lib/querykeys";

export function useReviews(animeId) {
    const normalizedAnimeId = String(animeId);

    return useQuery({
        queryKey: queryKeys.reviews.anime(normalizedAnimeId),
        queryFn: () => ReviewAPI.list(normalizedAnimeId),
        enabled: !!animeId,
    });
}

export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ReviewAPI.create,
        onSuccess: async (_, variables) => {
            const animeId = String(variables.anime_id);

            await queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.anime(animeId),
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.reviews,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.reviewAnalytics,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.topRated,
            });

            toast.success("Review saved!");
        },
        onError: () => {
            toast.error("Failed to save review");
        },
    });
}

export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId }) => ReviewAPI.delete(reviewId),
        onSuccess: async (_, variables) => {
            const animeId = String(variables.animeId);

            await queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.anime(animeId),
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.reviews,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.reviewAnalytics,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.topRated,
            });

            toast.success("Review deleted!");
        },
        onError: () => {
            toast.error("Failed to delete review");
        },
    });
}

export function useUserReviews() {
    return useQuery({
        queryKey: queryKeys.users.reviews,
        queryFn: ReviewAPI.myReviews,
    });
}

export function useReviewAnalytics() {
    return useQuery({
        queryKey: queryKeys.users.reviewAnalytics,
        queryFn: ReviewAPI.analytics,
    });
}

export function useTopRatedAnime() {
    return useQuery({
        queryKey: queryKeys.users.topRated,
        queryFn: ReviewAPI.topRated,
        select: (data) => data ?? [],
    });
}

export function useUpdateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, payload }) =>
            ReviewAPI.update(reviewId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.all,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.reviews,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.reviewAnalytics,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.topRated,
            });

            toast.success("Review updated!");
        },
        onError: () => {
            toast.error("Failed to update review");
        },
    });
}
