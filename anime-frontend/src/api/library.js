import api from "./client";

export const LibraryAPI = {

    list: async (page = 1) => {
        const res = await api.get("/users/library/", {
            params: { page }
        });

        const data = res.data.data;

        return {
            results: data?.results || [],
            next: data?.next || null,
            page: data?.page || page
        };
    },

    update: async (payload) => {
        const res = await api.post(
            "/users/library/update/",
            payload
        );

        return res.data.data;
    }
};