import { useState, useContext } from "react";
import { useRegister } from "../auth/useAuth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const registerMutation = useRegister();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();

        registerMutation.mutate(
            { username, password, email },
            {
                onSuccess: (res) => {
                    const { access, refresh} = res.data;

                    // auto login after register
                    login(access, refresh);

                    navigate("/");
                },
                onError: () => {
                    alert("Registration failed");
                }
            }
        );
    };

    return (
        <div style={{ maxWidth: 400, margin: "auto" }}>
            <form onSubmit={handleSubmit}>
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
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    type="submit"
                    disabled={registerMutation.isPending}
                >
                    {registerMutation.isPending
                        ? "Creating account..."
                        : "Register"}
                </button>
            </form>
        </div>
    );
}