import api from "./client";
export const UserAPI = {

    profile: async () => {
        const res = await api.get("/users/profile/");
        return res.data.data;
    },

    updateProfile: async (payload) => {
        const res = await api.put("/users/profile/update/", payload);
        return res.data.data;
    },

    stats: async () => {
        const res = await api.get("/users/library/stats/");
        return res.data.data;
    },

    activity: async (page = 1) => {
        const res = await api.get("/users/activity/", {
            params: { page }
        });


        return res.data;
    }
};