import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useRegister } from "../auth/useAuth";
import { AuthContext } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const registerMutation = useRegister();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username.trim() || !email.trim() || !password) {
            toast.error("Please fill in all fields.");
            return;
        }

        registerMutation.mutate(
            {
                username: username.trim(),
                email: email.trim(),
                password,
            },
            {
                onSuccess: (res) => {
                    const { access, refresh } = res.data;

                    login(access, refresh);

                    toast.success("Account created!");
                    navigate("/");
                },
                onError: () => {
                    toast.error("Registration failed. Please try again.");
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
                        JOIN ANIME TRACKER
                    </span>

                    <h1>Create your account</h1>

                    <p>
                        Build your library, track your progress,
                        and discover your next favorite anime.
                    </p>
                </div>

                <div className="auth-google">
                    <GoogleLoginButton />
                </div>

                <div className="auth-divider">
                    <span>or register with username</span>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >
                    <div className="auth-field">
                        <label htmlFor="register-username">
                            Username
                        </label>

                        <input
                            id="register-username"
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Choose a username"
                            autoComplete="username"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="register-email">
                            Email
                        </label>

                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="register-password">
                            Password
                        </label>

                        <input
                            id="register-password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Create a password"
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={registerMutation.isPending}
                    >
                        {registerMutation.isPending
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <button
                        type="button"
                        className="auth-link"
                        onClick={() => navigate("/login")}
                    >
                        Sign in
                    </button>
                </p>
            </section>
        </main>
    );
}