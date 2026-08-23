import axios from "axios";

import { tokenService } from "../auth/tokenService";
import {
    notifyAccessTokenChanged,
    notifySessionExpired,
} from "../auth/authEvents";

const baseURL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api";


/*
 * Normal application API client.
 * Requests from the application use this instance.
 */
const api = axios.create({
    baseURL,
});


/*
 * Separate client used only for refreshing
 * the access token.
 *
 * Important:
 * this instance has NO auth interceptor,
 * preventing refresh loops / circular dependencies.
 */
const refreshClient = axios.create({
    baseURL,
});


let isRefreshing = false;

let failedQueue = [];


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


/*
 * Attach the current access token
 * to every normal API request.
 */
api.interceptors.request.use(
    (config) => {
        if (config.skipAuth) {
            return config;
        }

        const accessToken = tokenService.getAccess();

        if (accessToken) {
            config.headers = config.headers ?? {};

            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);


/*
 * Handle expired access tokens.
 */
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }


        /*
         * Do not attempt refresh for authentication
         * endpoints themselves.
         */
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


        /*
         * Another request is already refreshing.
         * Wait for it instead of starting another refresh.
         */
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve,
                    reject,
                });
            }).then((newAccessToken) => {
                originalRequest.headers =
                    originalRequest.headers ?? {};

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);
            });
        }


        originalRequest._retry = true;

        isRefreshing = true;


        const refreshToken =
            tokenService.getRefresh();


        if (!refreshToken) {
            notifySessionExpired();

            return Promise.reject(error);
        }


        try {
            const response =
                await refreshClient.post(
                    "/auth/refresh/",
                    {
                        refresh: refreshToken,
                    }
                );


            const newAccessToken =
                response.data?.access;


            if (!newAccessToken) {
                throw new Error(
                    "Refresh response did not contain an access token."
                );
            }


            tokenService.setAccess(
                newAccessToken
            );

            notifyAccessTokenChanged(
                newAccessToken
            );


            processQueue(
                null,
                newAccessToken
            );


            originalRequest.headers =
                originalRequest.headers ?? {};

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;


            return api(originalRequest);

        } catch (refreshError) {
            processQueue(
                refreshError,
                null
            );

            notifySessionExpired();

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);


export default api;