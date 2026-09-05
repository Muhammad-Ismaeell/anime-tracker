import { lazy, Suspense, useContext } from "react";
import { Route, Routes } from "react-router-dom";

import { ThemeContext } from "../context/ThemeContext";
import NotFound from "../pages/NotFound";
import AppLayout from "./AppLayout";
import PageLoader from "../components/ui/PageLoader";
import ProtectedRoute from "../components/ProtectedRoute";
import ScrollToTop from "../components/ScrollToTop";

const Home = lazy(() => import("../pages/Home"));
const Detail = lazy(() => import("../pages/Detail"));
const AdvancedSearch = lazy(() => import("../pages/AdvancedSearch"));
const Trending = lazy(() => import("../pages/Trending"));
const Seasonal = lazy(() => import("../pages/Seasonal"));
const Top = lazy(() => import("../pages/Top"));
const RecentlyAdded = lazy(() => import("../pages/RecentlyAdded"));
const Recommendations = lazy(() => import("../pages/Recommendations"));

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));

const Library = lazy(() => import("../pages/Library"));
const Favorites = lazy(() => import("../pages/Favorites"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Profile = lazy(() => import("../pages/Profile"));
const EditProfile = lazy(() => import("../pages/EditProfile"));

export default function App() {
    const { darkMode } = useContext(ThemeContext);

    return (
        <div
            style={{
                background: darkMode ? "#111" : "#f5f5f5",
                color: darkMode ? "white" : "black",
                minHeight: "100vh",
            }}
        >
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/anime/:id" element={<Detail />} />
                        <Route path="/search" element={<AdvancedSearch />} />
                        <Route path="/trending" element={<Trending />} />
                        <Route path="/seasonal" element={<Seasonal />} />
                        <Route path="/top" element={<Top />} />
                        <Route path="/recently-added" element={<RecentlyAdded />} />
                    </Route>

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />

                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/library" element={<Library />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/edit-profile" element={<EditProfile />} />
                        <Route path="/recommendations" element={<Recommendations />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </div>
    );
}
