import { NavLink } from "react-router-dom";

import "./SideBar.css";


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
];


export default function SideBar({
    isOpen = false,
    onClose = () => {},
}) {
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
            </aside>
        </>
    );
}
