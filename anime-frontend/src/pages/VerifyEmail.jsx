import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import api from "../api/client";

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get("token");

    const [status, setStatus] = useState(
        token ? "loading" : "missing"
    );

    const [message, setMessage] = useState(
        token
            ? ""
            : "This verification link is missing a token."
    );

    useEffect(() => {
        if (!token) {
            return;
        }

        let cancelled = false;

        const verifyEmail = async () => {
            try {
                const response = await api.get(
                    "/auth/verify-email/",
                    {
                        params: { token },
                    }
                );

                if (cancelled) {
                    return;
                }

                setStatus("success");

                setMessage(
                    response.data?.detail ||
                    "Your email has been verified successfully."
                );
            } catch (error) {
                if (cancelled) {
                    return;
                }

                const detail =
                    error.response?.data?.detail || "";

                const normalizedDetail =
                    detail.toLowerCase();

                if (
                    normalizedDetail.includes("expired")
                ) {
                    setStatus("expired");
                    setMessage(
                        "This verification link has expired. Please request a new verification email."
                    );
                } else if (
                    normalizedDetail.includes("invalid")
                ) {
                    setStatus("invalid");
                    setMessage(
                        "This verification link is invalid. Please make sure you are using the latest verification email."
                    );
                } else {
                    setStatus("error");
                    setMessage(
                        detail ||
                        "We couldn't verify your email right now."
                    );
                }
            }
        };

        verifyEmail();

        return () => {
            cancelled = true;
        };
    }, [token]);

    const isFailure =
        status === "expired" ||
        status === "invalid" ||
        status === "error" ||
        status === "missing";

    return (
        <>
            <Helmet>
                <title>
                    Verify Email | Anime Tracker
                </title>

                <meta
                    name="description"
                    content="Verify your Anime Tracker email address."
                />
            </Helmet>

            <main className="auth-page">
                <div className="auth-background" />

                <Link
                    to="/"
                    className="auth-brand"
                >
                    <span className="auth-brand-mark">
                        🎬
                    </span>
                    <span>Anime Tracker</span>
                </Link>

                <section className="auth-card verify-email-card">
                    {status === "loading" && (
                        <>
                            <div className="verify-email-spinner" />

                            <span className="auth-eyebrow">
                                EMAIL VERIFICATION
                            </span>

                            <h1>
                                Verifying your email...
                            </h1>

                            <p>
                                Please wait while we verify
                                your email address.
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="verify-email-icon success">
                                ✓
                            </div>

                            <span className="auth-eyebrow">
                                EMAIL VERIFIED
                            </span>

                            <h1>
                                You're all set
                            </h1>

                            <p>
                                {message}
                            </p>

                            <Link
                                to="/login"
                                className="auth-submit verify-email-action"
                            >
                                Continue to Login
                            </Link>
                        </>
                    )}

                    {isFailure && (
                        <>
                            <div className="verify-email-icon error">
                                !
                            </div>

                            <span className="auth-eyebrow">
                                EMAIL VERIFICATION
                            </span>

                            <h1>
                                {status === "expired"
                                    ? "Verification link expired"
                                    : status === "invalid"
                                      ? "Verification link invalid"
                                      : status === "missing"
                                        ? "Verification link incomplete"
                                        : "Verification failed"}
                            </h1>

                            <p>
                                {message}
                            </p>

                            <div className="verify-email-actions">
                                <Link
                                    to="/login"
                                    className="auth-submit verify-email-action"
                                >
                                    Back to Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="auth-link verify-email-login"
                                >
                                    Create another account
                                </Link>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </>
    );
}