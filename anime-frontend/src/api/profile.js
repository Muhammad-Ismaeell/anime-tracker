import api from "./client";

export const fetchProfile = async () => {
    const res = await api.get("/users/profile/");
    return res.data.data;
};

export const updateProfile = async (data) => {
    const res = await api.put("/users/profile/update/", data);
    return res.data.data;
};