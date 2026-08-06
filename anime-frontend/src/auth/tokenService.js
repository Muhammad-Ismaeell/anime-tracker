const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const tokenService = {

    set(access, refresh) {
        localStorage.setItem(ACCESS_KEY, access);
        localStorage.setItem(REFRESH_KEY, refresh);
    },

    getAccess() {
        return localStorage.getItem(ACCESS_KEY);
    },

    getRefresh() {
        return localStorage.getItem(REFRESH_KEY);
    },

    setAccess(token) {
        localStorage.setItem(ACCESS_KEY, token);
    },

    clear() {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    }
};