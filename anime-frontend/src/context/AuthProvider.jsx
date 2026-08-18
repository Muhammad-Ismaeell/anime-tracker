import { useCallback, useEffect, useState } from "react";
import { AuthAPI } from "../api/auth.api";
import { tokenService } from "../auth/tokenService";
import { AuthContext } from "./AuthContext";

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!token;

    const login = useCallback((access, refresh, userData = null) => {
        tokenService.set(access, refresh);
        setToken(access);
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        const refresh = tokenService.getRefresh();

        try {
            await AuthAPI.logout({ refresh });
        } catch {
            // Logout should still clear the local session
            // even when the server request fails.
        }

        tokenService.clear();
        setToken(null);
        setUser(null);
    }, []);

    const loadUser = useCallback(async () => {
        try {
            const res = await AuthAPI.me();
            setUser(res.data);
        } catch {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const access = tokenService.getAccess();

            if (access) {
                setToken(access);
                await loadUser();
                setLoading(false);
                return;
            }

            tokenService.clear();
            setToken(null);
            setUser(null);
            setLoading(false);
        };

        init();
    }, [loadUser]);

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