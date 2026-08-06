import api from "./client";


export const AuthAPI = {

    login(data) {
        return api.post(
            "/auth/login/",
            data
        );
    },


    register(data) {
        return api.post(
            "/auth/register/",
            data
        );
    },


    googleLogin(token) {
        return api.post(
            "/auth/google/",
            {
                token
            }
        );
    },


    refresh(refresh) {
        return api.post(
            "/auth/refresh/",
            {
                refresh
            }
        );
    },


    logout(refresh) {
        return api.post(
            "/auth/logout/",
            {
                refresh
            }
        );
    },


    me() {
        return api.get(
            "/auth/me/"
        );
    }

};