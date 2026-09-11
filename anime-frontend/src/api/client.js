import axios from "axios";

import { tokenService } from "../auth/tokenService";
import {
    notifyAccessTokenChanged,
    notifySessionExpired,
} from "../auth/authEvents";

const baseURL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api";

const api = axios.create({
    baseURL,
});

const refreshClient = axios.create({
    baseURL,
});

let isRefreshing = false;
let failedQueue = [];

const COLD_START_DELAY = 500;
let slowRequestCount = 0;

const emitColdStart = (type) => {
    window.dispatchEvent(
        new CustomEvent("anime-tracker:cold-start", {
            detail: {
                type,
                count: slowRequestCount,
            },
        })
    );
};

const markSlowRequest = (config) => {
    if (config.skipColdStart) return;

    config.__coldStartTimer = window.setTimeout(() => {
        config.__coldStartTimer = null;
        config.__coldStartSlow = true;
        slowRequestCount += 1;
        emitColdStart("start");
    }, COLD_START_DELAY);
};

const finishColdStartRequest = (config) => {
    if (!config) return;

    if (config.__coldStartTimer) {
        window.clearTimeout(config.__coldStartTimer);
        config.__coldStartTimer = null;
    }

    if (config.__coldStartSlow) {
        config.__coldStartSlow = false;
        slowRequestCount = Math.max(0, slowRequestCount - 1);
        emitColdStart("end");
    }
};

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        markSlowRequest(config);

        if (config.skipAuth) {
            return config;
        }

        const accessToken = tokenService.getAccess();

        if (accessToken) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        finishColdStartRequest(response.config);
        return response;
    },

    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        finishColdStartRequest(originalRequest);

        const isAuthRequest =
            originalRequest.url?.includes("/auth/login/") ||
            originalRequest.url?.includes("/auth/register/") ||
            originalRequest.url?.includes("/auth/google/") ||
            originalRequest.url?.includes("/auth/logout/") ||
            originalRequest.url?.includes("/auth/refresh/");

        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            isAuthRequest ||
            originalRequest.skipAuth
        ) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((newAccessToken) => {
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = tokenService.getRefresh();

        if (!refreshToken) {
            notifySessionExpired();
            return Promise.reject(error);
        }

        try {
            const response = await refreshClient.post("/auth/refresh/", {
                refresh: refreshToken,
            });

            const newAccessToken = response.data?.access;

            if (!newAccessToken) {
                throw new Error(
                    "Refresh response did not contain an access token."
                );
            }

            tokenService.setAccess(newAccessToken);
            notifyAccessTokenChanged(newAccessToken);
            processQueue(null, newAccessToken);

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            notifySessionExpired();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
