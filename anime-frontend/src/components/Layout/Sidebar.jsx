import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "10px",
    textDecoration: "none",
    color: "white",
    background: isActive ? "#7c3aed" : "#18181b"
});

export default function Sidebar() {

    const { token, logout } = useContext(AuthContext);

    return (
        <aside
            style={{
                width: "240px",
                height: "calc(100vh - 60px)", // 🔥 IMPORTANT (navbar space)
                position: "sticky",
                top: "60px", // 🔥 pushes under navbar
                background: "linear-gradient(to bottom, #09090b, #111827)",
                borderRight: "1px solid #222",
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                justifyContent: "space-between", // 🔥 forces logout bottom
                overflow: "hidden"
            }}
        >

            {/* TOP NAV */}
            <div>
                <h2 style={{ color: "white", marginBottom: "30px" }}>
                    🎬 Anime App
                </h2>

                <NavLink to="/" style={linkStyle}>🏠 Home</NavLink>
                <NavLink to="/library" style={linkStyle}>📚 Library</NavLink>
                <NavLink to="/favorites" style={linkStyle}>❤️ Favorites</NavLink>
                <NavLink to="/dashboard" style={linkStyle}>📊 Dashboard</NavLink>
                <NavLink to="/profile" style={linkStyle}>👤 Profile</NavLink>
            </div>

            {/* BOTTOM (ALWAYS VISIBLE) */}
            <div style={{ marginTop: "auto" }}>
                {token && (
                    <button
                        onClick={logout}
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: "none",
                            background: "#dc2626",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Logout
                    </button>
                )}
            </div>

        </aside>
    );
}