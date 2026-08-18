import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useLogin } from "../auth/useAuth";
import { AuthContext } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { login: setAuth } = useContext(AuthContext);
    const loginMutation = useLogin();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        if (!username.trim() || !password) {
            toast.error("Please enter your username and password.");
            return;
        }

        loginMutation.mutate(
            {
                username: username.trim(),
                password,
            },
            {
                onSuccess: (res) => {
                    const { access, refresh, user } = res.data;

                    setAuth(access, refresh, user);

                    toast.success("Welcome back!");
                    navigate("/");
                },
                onError: () => {
                    toast.error("Invalid username or password.");
                },
            }
        );
    };

    return (
        <main className="auth-page">
            <div className="auth-background" />

            <div className="auth-brand">
                <span className="auth-brand-mark">✦</span>
                <span>Anime Tracker</span>
            </div>

            <section className="auth-card">
                <div className="auth-header">
                    <span className="auth-eyebrow">
                        WELCOME BACK
                    </span>

                    <h1>Sign in to Anime Tracker</h1>

                    <p>
                        Keep track of what you're watching,
                        discover something new, and build your
                        anime library.
                    </p>
                </div>

                <div className="auth-google">
                    <GoogleLoginButton />
                </div>

                <div className="auth-divider">
                    <span>or continue with username</span>
                </div>

                <form
                    onSubmit={handleLogin}
                    className="auth-form"
                >
                    <div className="auth-field">
                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Enter your username"
                            autoComplete="username"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending
                            ? "Signing in..."
                            : "Sign in"}
                    </button>
                </form>

                <p className="auth-footer">
                    New to Anime Tracker?{" "}
                    <button
                        type="button"
                        className="auth-link"
                        onClick={() => navigate("/register")}
                    >
                        Create an account
                    </button>
                </p>
            </section>
        </main>
    );
}