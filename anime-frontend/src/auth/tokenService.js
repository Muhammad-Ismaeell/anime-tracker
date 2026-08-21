const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const storage = window.localStorage;

export const tokenService = {
    set(access, refresh) {
        if (access) {
            storage.setItem(ACCESS_KEY, access);
        }

        if (refresh) {
            storage.setItem(REFRESH_KEY, refresh);
        }
    },

    getAccess() {
        return storage.getItem(ACCESS_KEY);
    },

    getRefresh() {
        return storage.getItem(REFRESH_KEY);
    },

    setAccess(access) {
        if (!access) {
            return;
        }

        storage.setItem(ACCESS_KEY, access);
    },

    clear() {
        storage.removeItem(ACCESS_KEY);
        storage.removeItem(REFRESH_KEY);
    },
};