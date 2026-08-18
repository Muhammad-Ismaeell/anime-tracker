import { useState, useContext } from "react";
import { useLogin } from "../auth/useAuth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { login: setAuth } = useContext(AuthContext);
    const loginMutation = useLogin();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        loginMutation.mutate(
            { username, password },
            {
                onSuccess: (res) => {
                    const { access, refresh, user } = res.data;

                    setAuth(access, refresh, user);

                    navigate("/");
                },
                onError: () => {
                    alert("Invalid credentials");
                }
            }
        );
    };

    return (
        <div style={{ maxWidth: 400, margin: "auto" }}>
            <form onSubmit={handleLogin}>
                <input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button 
                    type="submit"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending
                        ? "Logging in..."
                        : "Login"}
                </button>
            </form>

            {/* GOOGLE LOGIN */}
            <GoogleLoginButton
            />
        </div>
    );
}