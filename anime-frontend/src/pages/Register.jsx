import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useRegister } from "../auth/useAuth";
import GoogleLoginButton from "../components/GoogleLoginButton";


export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [registrationComplete, setRegistrationComplete] =
        useState(false);

    const [registeredEmail, setRegisteredEmail] =
        useState("");

    const registerMutation = useRegister();
    const navigate = useNavigate();


    const handleSubmit = (event) => {
        event.preventDefault();

        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (
            !cleanUsername ||
            !cleanEmail ||
            !password
        ) {
            toast.error(
                "Please fill in all fields."
            );
            return;
        }

        registerMutation.mutate(
            {
                username: cleanUsername,
                email: cleanEmail,
                password,
            },
            {
                onSuccess: (response) => {
                    const data = response?.data ?? {};

                    setRegisteredEmail(
                        data.email || cleanEmail
                    );

                    setRegistrationComplete(true);

                    toast.success(
                        "Account created. Check your email."
                    );
                },

                onError: (error) => {
                    const message =
                        error.response?.data?.detail ||
                        "Registration failed. Please try again.";

                    toast.error(message);
                },
            }
        );
    };


    if (registrationComplete) {
        return (
            <main className="auth-page">
                <div className="auth-background" />

                <div className="auth-brand">
                    <span className="auth-brand-mark">
                        ✦
                    </span>

                    <span>Anime Tracker</span>
                </div>

                <section className="auth-card verify-email-card">
                    <div className="verify-email-icon success">
                        ✓
                    </div>

                    <div className="auth-header">
                        <span className="auth-eyebrow">
                            ACCOUNT CREATED
                        </span>

                        <h1>
                            Check your email
                        </h1>

                        <p>
                            We've sent a verification link to:
                        </p>

                        <strong className="verification-email">
                            {registeredEmail}
                        </strong>

                        <p>
                            Verify your email address before
                            signing in to Anime Tracker.
                            The verification link expires
                            after 24 hours.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="auth-submit"
                        onClick={() => navigate("/login")}
                    >
                        Go to Login
                    </button>
                </section>
            </main>
        );
    }


    return (
        <main className="auth-page">
            <div className="auth-background" />

            <div className="auth-brand">
                <span className="auth-brand-mark">
                    ✦
                </span>

                <span>Anime Tracker</span>
            </div>

            <section className="auth-card">
                <div className="auth-header">
                    <span className="auth-eyebrow">
                        JOIN ANIME TRACKER
                    </span>

                    <h1>
                        Create your account
                    </h1>

                    <p>
                        Build your library, track your progress,
                        and discover your next favorite anime.
                    </p>
                </div>

                <div className="auth-google">
                    <GoogleLoginButton />
                </div>

                <div className="auth-divider">
                    <span>
                        or register with username
                    </span>
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
                            onChange={(event) =>
                                setUsername(
                                    event.target.value
                                )
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
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
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
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Create a password"
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={
                            registerMutation.isPending
                        }
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
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Sign in
                    </button>
                </p>
            </section>
        </main>
    );
}