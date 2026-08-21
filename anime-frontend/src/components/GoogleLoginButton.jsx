import { useContext, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import { AuthAPI } from "../api/auth.api";
import GoogleSignIn from "./GoogleSignIn";


export default function GoogleLoginButton() {
    const { login } = useContext(AuthContext);

    const [error, setError] = useState(null);

    const handleGoogleLogin = async (credentialResponse) => {
        setError(null);

        try {
            const credential = credentialResponse?.credential;

            if (!credential) {
                throw new Error("Missing Google credential.");
            }

            const res = await AuthAPI.googleLogin(
                credential
            );

            const {
                access,
                refresh,
                user,
            } = res.data;

            if (!access || !refresh) {
                throw new Error(
                    "Authentication response is incomplete."
                );
            }

            await login(
                access,
                refresh,
                user
            );

            window.location.href = "/";
        } catch {
            setError(
                "Google login failed. Please try again."
            );
        }
    };

    return (
        <>
            <GoogleSignIn
                onSuccess={handleGoogleLogin}
                onError={() => {
                    setError("Google login failed.");
                }}
            />

            {error && (
                <p className="auth-error">
                    {error}
                </p>
            )}
        </>
    );
}