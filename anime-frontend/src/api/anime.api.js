import api from "./client";

export const AnimeAPI = {
    trending: async (page = 1) => {
        const res = await api.get("/anime/trending/", {
            params: { page },
            skipAuth: true,
        });

        return res.data;
    },

    seasonal: async (page = 1) => {
        const res = await api.get("/anime/seasonal/", {
            params: { page },
            skipAuth: true,
        });

        return res.data;
    },

    top: async (page = 1) => {
        const res = await api.get("/anime/top/", {
            params: { page },
            skipAuth: true,
        });

        return res.data;
    },

    recentlyAdded: async (page = 1) => {
        const res = await api.get("/anime/recently-added/", {
            params: { page },
            skipAuth: true,
        });

        return res.data;
    },

    detail: async (id) => {
        const res = await api.get(`/anime/${id}/`, {
            skipAuth: true,
        });

        return res.data;
    },

    recommendations: async (id) => {
        const res = await api.get(`/anime/${id}/recommendations/`, {
            skipAuth: true,
        });

        return res.data;
    },

    episodes: async (id, page = 1) => {
        const res = await api.get(`/anime/${id}/episodes/`, {
            params: { page },
            skipAuth: true,
        });

        return res.data;
    },

    characters: async (id) => {
        const res = await api.get(`/anime/${id}/characters/`, {
            skipAuth: true,
        });

        return res.data;
    },

    staff: async (id) => {
        const res = await api.get(`/anime/${id}/staff/`, {
            skipAuth: true,
        });

        return res.data;
    },

    search: async ({ query, page = 1, filters = {} }) => {
        const res = await api.get("/anime/search/", {
            params: {
                q: query,
                page,
                ...filters,
            },
            skipAuth: true,
        });

        return res.data;
    },
};
