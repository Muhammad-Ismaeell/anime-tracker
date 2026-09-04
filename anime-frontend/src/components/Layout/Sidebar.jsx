import { NavLink } from "react-router-dom";
import "./SideBar.css";

const navSections = [
    {
        title: "DISCOVER",
        items: [
            { to: "/trending", label: "Trending", icon: "🔥" },
            { to: "/seasonal", label: "Seasonal", icon: "🌸" },
            { to: "/top", label: "Top Anime", icon: "🏆" },
            { to: "/recently-added", label: "Recently Added", icon: "✨" },
        ],
    },
    {
        title: "MY ANIME",
        items: [
            { to: "/library", label: "Library", icon: "📚" },
            { to: "/favorites", label: "Favorites", icon: "❤️" },
            { to: "/dashboard", label: "Dashboard", icon: "📊" },
        ],
    },
];

export default function SideBar({ isOpen = false, onClose = () => {} }) {
    const handleNavigation = () => onClose();

    return (
        <>
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
                <div className="sidebar-content">
                    <nav className="sidebar-nav" aria-label="Main navigation">
                        {navSections.map((section) => (
                            <div className="sidebar-section" key={section.title}>
                                <div className="sidebar-section-title">
                                    {section.title}
                                </div>

                                <div className="sidebar-section-items">
                                    {section.items.map((item) => (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            onClick={handleNavigation}
                                            className={({ isActive }) =>
                                                `sidebar-link ${isActive ? "active" : ""}`
                                            }
                                        >
                                            <span
                                                className="sidebar-link-icon"
                                                aria-hidden="true"
                                            >
                                                {item.icon}
                                            </span>
                                            <span>{item.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}
