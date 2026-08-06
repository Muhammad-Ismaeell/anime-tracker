import { createContext, useEffect, useState, useCallback } from "react";
import { AuthAPI } from "../api/auth.api";
import { tokenService } from "../auth/tokenService";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!token;

    // =========================
    // LOGIN
    // =========================
    const login = useCallback((access, refresh, userData = null) => {
        tokenService.set(access, refresh);
        setToken(access);
        setUser(userData);
    }, []);

    // =========================
    // LOGOUT
    // =========================
    const logout = useCallback(async () => {

        const refresh = tokenService.getRefresh();

        try {
            await AuthAPI.logout({
                refresh
            });
        }
        catch(e){
            console.log(e);
        }

        tokenService.clear();

        setToken(null);
        setUser(null);

    }, []);

    // =========================
    // LOAD USER (ME)
    // =========================
    const loadUser = useCallback(async () => {
        try {
            const res = await AuthAPI.me();
            setUser(res.data);
        } catch (e) {
            setUser(null);
        }
    }, []);

    // =========================
    // INITIAL AUTH RESTORE
    // =========================
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
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            loading,
            login,
            logout,
            loadUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}