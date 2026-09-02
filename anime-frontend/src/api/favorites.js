import api from "./client";

export const FavoriteAPI = {

    list: async (page = 1) => {
        const res = await api.get(
            "/users/favorites/",
            {
                params: { page }
            }
        );

        const data = res.data?.data;

        return {
            results: data?.results ?? [],
            count: data?.count ?? 0,
            next: data?.next ?? null,
            previous: data?.previous ?? null,
        };
    },


    listIds: async () => {
        const res = await api.get(
            "/users/favorites/ids/"
        );

        const data = res.data?.data;

        /*
         * The endpoint returns the IDs directly:
         *
         * {
         *     success: true,
         *     data: [1, 2, 3, ...]
         * }
         */

        return Array.isArray(data)
            ? data
            : [];
    },


    toggle: async (payload) => {
        const res = await api.post(
            "/users/favorites/toggle/",
            payload
        );

        return res.data;
    }
};