import { useContext } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import PageLoader from "../components/ui/PageLoader";

export default function ProtectedRoute({
    children,
}) {
    const {
        isAuthenticated,
        loading,
    } = useContext(AuthContext);

    const location = useLocation();
    const navigate = useNavigate();

    if (loading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return (
            <div className="auth-page">
                <div className="auth-background" />

                <section className="auth-card session-expired-card">
                    <div className="verify-email-icon error">
                        🔐
                    </div>

                    <span className="auth-eyebrow">
                        SESSION EXPIRED
                    </span>

                    <h1>
                        Please sign in again
                    </h1>

                    <p>
                        Your session has expired. Sign in
                        again to access your library,
                        favorites, and profile.
                    </p>

                    <div className="session-expired-actions">
                        <button
                            type="button"
                            className="auth-submit"
                            onClick={() =>
                                navigate("/login", {
                                    state: {
                                        from: location,
                                    },
                                })
                            }
                        >
                            Sign In
                        </button>

                        <button
                            type="button"
                            className="auth-link"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create Account
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    return children;
}