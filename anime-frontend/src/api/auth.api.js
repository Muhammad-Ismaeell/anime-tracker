import api from "./client";

export const AuthAPI = {
    login(data) {
        return api.post("/auth/login/", data);
    },

    register(data) {
        return api.post("/auth/register/", data);
    },

    googleLogin(credential) {
        return api.post("/auth/google/", {
            token: credential,
        });
    },

    refresh(refreshToken) {
        return api.post("/auth/refresh/", {
            refresh: refreshToken,
        });
    },

    logout(refreshToken) {
        return api.post("/auth/logout/", {
            refresh: refreshToken,
        });
    },

    me() {
        return api.get("/auth/me/");
    },
};