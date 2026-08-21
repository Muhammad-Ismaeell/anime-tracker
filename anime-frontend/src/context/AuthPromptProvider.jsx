import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthPromptContext } from "./AuthPromptContext";

export function AuthPromptProvider({ children }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const showLoginRequired = () => {
        setOpen(true);
    };

    const closeLoginRequired = () => {
        setOpen(false);
    };

    const goToLogin = () => {
        setOpen(false);
        navigate("/login");
    };

    const goToRegister = () => {
        setOpen(false);
        navigate("/register");
    };

    return (
        <AuthPromptContext.Provider
            value={{
                showLoginRequired,
                closeLoginRequired,
            }}
        >
            {children}

            {open && (
                <div
                    className="auth-prompt-overlay"
                    onClick={closeLoginRequired}
                >
                    <div
                        className="auth-prompt-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <button
                            type="button"
                            className="auth-prompt-close"
                            onClick={closeLoginRequired}
                            aria-label="Close"
                        >
                            ✕
                        </button>

                        <div className="auth-prompt-icon">
                            🔐
                        </div>

                        <span className="auth-eyebrow">
                            SIGN IN REQUIRED
                        </span>

                        <h2>
                            Sign in to continue
                        </h2>

                        <p>
                            Create an account or sign in to
                            save favorites, manage your
                            library, and use your personal
                            features.
                        </p>

                        <div className="auth-prompt-actions">
                            <button
                                type="button"
                                className="auth-prompt-primary"
                                onClick={goToLogin}
                            >
                                Sign In
                            </button>

                            <button
                                type="button"
                                className="auth-prompt-secondary"
                                onClick={goToRegister}
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthPromptContext.Provider>
    );
}