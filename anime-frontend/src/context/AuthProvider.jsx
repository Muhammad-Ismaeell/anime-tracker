import { useCallback, useEffect, useState } from "react";

import { AuthAPI } from "../api/auth.api";
import { tokenService } from "../auth/tokenService";
import { AuthContext } from "./AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/querykeys";
import {
    setAccessTokenListener,
    setSessionExpiredListener,
} from "../auth/authEvents";

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    const refreshPrivateCache = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: queryKeys.users.favorites,
            exact: false,
        });

        queryClient.invalidateQueries({
            queryKey: queryKeys.users.library,
            exact: false,
        });

        queryClient.invalidateQueries({
            queryKey: queryKeys.users.dashboard,
            exact: false,
        });
    }, [queryClient]);
    const clearPrivateCache = useCallback(() => {
        queryClient.resetQueries({
            queryKey: queryKeys.users.favorites,
            exact: false,
        });

        queryClient.resetQueries({
            queryKey: queryKeys.users.library,
            exact: false,
        });

        queryClient.resetQueries({
            queryKey: queryKeys.users.dashboard,
            exact: false,
        });

        queryClient.resetQueries({
            queryKey: ["favoriteIds"],
            exact: false,
        });
    }, [queryClient]);
    const isAuthenticated = Boolean(token);

    const loadUser = useCallback(async () => {
        try {
            const res = await AuthAPI.me();

            setUser(res.data);

            return res.data;
        } catch {
            setUser(null);
            return null;
        }
    }, []);

    const login = useCallback(
        async (access, refresh, userData = null) => {
            tokenService.set(access, refresh);

            setToken(access);

            let loggedInUser = userData;

            if (!loggedInUser) {
                loggedInUser = await loadUser();
            } else {
                setUser(loggedInUser);
            }

            refreshPrivateCache();

            return loggedInUser;
        },
        [loadUser, refreshPrivateCache]
    );

    const logout = useCallback(async () => {
        const refresh = tokenService.getRefresh();

        try {
            if (refresh) {
                await AuthAPI.logout({
                    refresh,
                });
            }
        } catch {
            // Local logout must still succeed.
        }

        tokenService.clear();
        setToken(null);
        setUser(null);

        window.location.href = "/";
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            const access = tokenService.getAccess();

            if (!access) {
                tokenService.clear();

                setToken(null);
                setUser(null);
                setLoading(false);

                return;
            }

            setToken(access);

            await loadUser();

            setLoading(false);
        };

        initializeAuth();
    }, [loadUser]);

    useEffect(() => {
        setAccessTokenListener((newToken) => {
            setToken(newToken);
        });

        return () => {
            setAccessTokenListener(null);
        };
    }, []);

    useEffect(() => {
        setAccessTokenListener((newToken) => {
            setToken(newToken);
        });

        setSessionExpiredListener(() => {
            tokenService.clear();

            setToken(null);
            setUser(null);

            clearPrivateCache();
        });

        return () => {
            setAccessTokenListener(null);
            setSessionExpiredListener(null);
        };
    }, [clearPrivateCache]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                loading,
                login,
                logout,
                loadUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;