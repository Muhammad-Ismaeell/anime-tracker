import { useState } from "react";

import Sidebar from "../components/Layout/Sidebar";
import Navbar from "../components/Layout/NavBar";
import { Outlet } from "react-router-dom";


export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen((current) => !current);
    };

    return (
        <div className="app-layout">
            <Navbar
                onMenuToggle={toggleSidebar}
                sidebarOpen={sidebarOpen}
            />

            <div className="app-layout-body">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={closeSidebar}
                />

                <main className="main-content">
                    <Outlet />

                    <footer className="footer">
                        <p>
                            Anime Tracker © 2026
                        </p>

                        <p>
                            Built with React • Django • Jikan API
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
}