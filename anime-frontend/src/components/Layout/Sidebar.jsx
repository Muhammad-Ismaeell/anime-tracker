import { NavLink } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../../context/AuthContext";

import "./Sidebar.css";


const navItems = [
    {
        to: "/",
        label: "Home",
        icon: "🏠",
    },
    {
        to: "/library",
        label: "Library",
        icon: "📚",
    },
    {
        to: "/favorites",
        label: "Favorites",
        icon: "❤️",
    },
    {
        to: "/dashboard",
        label: "Dashboard",
        icon: "📊",
    },
    {
        to: "/profile",
        label: "Profile",
        icon: "👤",
    },
];


export default function Sidebar({
    isOpen = false,
    onClose = () => {},
}) {
    const { token, logout } = useContext(AuthContext);

    const handleNavigation = () => {
        onClose();
    };

    return (
        <>
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`sidebar ${
                    isOpen ? "sidebar-open" : ""
                }`}
            >
                <div className="sidebar-content">

                    <div className="sidebar-brand">
                        <span className="sidebar-brand-icon">
                            🎬
                        </span>
                    </div>

                    <nav className="sidebar-nav">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                onClick={handleNavigation}
                                className={({ isActive }) =>
                                    `sidebar-link ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >
                                <span className="sidebar-link-icon">
                                    {item.icon}
                                </span>

                                <span>
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {token && (
                    <div className="sidebar-footer">
                        <button
                            type="button"
                            className="sidebar-logout"
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                        >
                            <span>🚪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}