import api from "./client";

export const AnimeAPI = {

    trending: async (page = 1) => {
        const res = await api.get("/anime/trending/", {
            params: { page }
        });

        return res.data;
    },

    seasonal: async (page = 1) => {
        const res = await api.get("/anime/seasonal/", {
            params: { page }
        });

        return res.data;
    },

    top: async (page = 1) => {
        const res = await api.get("/anime/top/", {
            params: { page }
        });

        return res.data;
    },

    detail: async (id) => {
        const res = await api.get(`/anime/${id}/`);
        return res.data;
    },

    search: async ({ query, page = 1, filters = {} }) => {
        const res = await api.get("/anime/search/", {
            params: {
                q: query,
                page,
                ...filters
            }
        });

        return res.data;
    }
};