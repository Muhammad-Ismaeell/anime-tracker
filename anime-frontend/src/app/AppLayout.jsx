import Sidebar from "../components/Layout/Sidebar";
import Navbar from "../components/Layout/NavBar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {

    return (
        <div className="app-layout">

            {/* TOP NAVBAR */}
            <Navbar />

            <div className="app-layout-body">

                {/* SIDEBAR */}
                <Sidebar />

                {/* MAIN CONTENT */}
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