import { NavLink } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../../context/AuthContext";

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
    {
        to: "/profile",
        label: "Profile",
        icon: "👤",
    },
];


function Sidebar() {

    const { token, logout } = useContext(AuthContext);


    return (
        <aside className="sidebar">

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
                        onClick={logout}
                    >
                        <span>
                            🚪
                        </span>

                        <span>
                            Logout
                        </span>
                    </button>

                </div>
            )}

        </aside>
    );
}


export default Sidebar;