// api/review.api.js

import api from "./client";

export const ReviewAPI = {

    list: async (animeId) => {

        const res = await api.get(
            `/users/reviews/${animeId}/`
        );

        return res.data.data;
    },

    create: async (payload) => {

        const res = await api.post(
            "/users/reviews/",
            payload
        );

        return res.data.data;
    },

    delete: async (reviewId) => {
        const res = await api.delete(
            `/users/reviews/${reviewId}/delete/`
        );

        return res.data.data;
    },

    myReviews: async () => {
        const res = await api.get("/users/reviews/my-reviews/");
        return res.data.data ?? [];
    },

    analytics: async () => {

        const res = await api.get(
            "/users/reviews/analytics/"
        );

        return res.data.data;
    },

    topRated: async () => {

        const res = await api.get(
            "/users/reviews/top-rated/"
        );

        return res.data.data;
    },
    update: async (reviewId, payload) => {
        const res = await api.put(
            `/users/reviews/${reviewId}/update/`,
            payload
        );

        return res.data.data;
    },
};