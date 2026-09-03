import {
    useState,
    useRef,
    useEffect,
    useContext,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { useNavbarSearch } from "../../hooks/useNavbarSearch";
import { useDebounce } from "../../hooks/useDebounce";
import { useProfile } from "../../hooks/useProfile";
import { getMediaUrl } from "../../utils/mediaUrl";

import "./Navbar.css";

function NavBar({
    onMenuToggle = () => {},
    sidebarOpen = false,
}) {
    const navigate = useNavigate();
    const { isAuthenticated, user, loading, logout } = useContext(AuthContext);
    const { data: profile } = useProfile();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const debouncedQuery = useDebounce(query, 500);
    const { data: results = [], isLoading } = useNavbarSearch(debouncedQuery);

    const dropdownRef = useRef(null);
    const profileMenuRef = useRef(null);

    const profileAvatar = profile?.profile?.avatar ?? null;
    const username = user?.username || "Profile";
    const avatarUrl = profileAvatar ? getMediaUrl(profileAvatar) : null;
    const avatarFallback = username.charAt(0).toUpperCase() || "U";
    const hasSearchQuery = query.trim().length >= 3;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
                setProfileMenuOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    const handleSelect = (anime) => {
        const id = anime?.id ?? anime?.mal_id;
        if (id == null) return;

        setOpen(false);
        setQuery("");
        navigate(`/anime/${id}`);
    };

    const handleSearchSubmit = () => {
        const value = query.trim();
        if (!value) return;

        setOpen(false);
        navigate(`/search?q=${encodeURIComponent(value)}`);
    };

    const handleLogout = () => {
        setProfileMenuOpen(false);
        logout();
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <button
                    type="button"
                    className="navbar-menu-button"
                    onClick={onMenuToggle}
                    aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
                    aria-expanded={sidebarOpen}
                >
                    {sidebarOpen ? "✕" : "☰"}
                </button>

                <Link to="/" className="navbar-logo" aria-label="Anime Tracker home">
                    <span className="logo-mark" aria-hidden="true">A</span>
                    <span className="navbar-logo-text">Anime Tracker</span>
                </Link>

                <nav className="navbar-nav" aria-label="Primary navigation">
                    <Link to="/" className="navbar-nav-link">Home</Link>
                    <Link to="/search" className="navbar-nav-link">Anime</Link>
                    {isAuthenticated && (
                        <Link to="/library" className="navbar-nav-link">Library</Link>
                    )}
                    {isAuthenticated && (
                        <Link to="/favorites" className="navbar-nav-link">Favorites</Link>
                    )}
                </nav>
            </div>

            <div ref={dropdownRef} className="navbar-search-wrapper">
                <div className="navbar-search">
                    <span className="navbar-search-icon" aria-hidden="true">⌕</span>
                    <input
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => {
                            if (query.trim()) setOpen(true);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") handleSearchSubmit();
                            if (event.key === "Escape") setOpen(false);
                        }}
                        placeholder="Search anime..."
                        className="navbar-search-input"
                        aria-label="Search anime"
                        aria-expanded={open && hasSearchQuery}
                    />
                    {query && (
                        <button
                            type="button"
                            className="navbar-search-clear"
                            onClick={() => {
                                setQuery("");
                                setOpen(false);
                            }}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {open && hasSearchQuery && (
                    <div className="navbar-dropdown">
                        {isLoading ? (
                            <div className="navbar-message">Searching anime...</div>
                        ) : results.length === 0 ? (
                            <div className="navbar-message">No anime found</div>
                        ) : (
                            results.slice(0, 6).map((anime) => (
                                <button
                                    type="button"
                                    key={anime.id ?? anime.mal_id}
                                    className="navbar-result"
                                    onClick={() => handleSelect(anime)}
                                >
                                    <img src={anime.image} alt="" className="navbar-thumb" />
                                    <span className="navbar-result-info">
                                        <span className="navbar-title">{anime.title}</span>
                                        <span className="navbar-meta">{anime.type}</span>
                                    </span>
                                </button>
                            ))
                        )}

                        {!isLoading && results.length > 0 && (
                            <button
                                type="button"
                                className="navbar-view-all"
                                onClick={handleSearchSubmit}
                            >
                                View all results <span aria-hidden="true">→</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="navbar-right">
                {!isAuthenticated ? (
                    <>
                        <Link to="/login" className="navbar-login">Login</Link>
                        <Link to="/register" className="navbar-register">Sign Up</Link>
                    </>
                ) : (
                    <div ref={profileMenuRef} className="profile-menu-wrapper">
                        <button
                            type="button"
                            className="navbar-profile-trigger"
                            onClick={() => setProfileMenuOpen((current) => !current)}
                            aria-label="Open profile menu"
                            aria-expanded={profileMenuOpen}
                            aria-haspopup="menu"
                        >
                            <span className="profile-avatar-mini profile-avatar-mini-image">
                                {avatarUrl ? <img src={avatarUrl} alt="" /> : avatarFallback}
                            </span>
                            <span className="navbar-profile-name">
                                {loading ? "Loading..." : username}
                            </span>
                            <span className={`profile-menu-chevron ${profileMenuOpen ? "open" : ""}`} aria-hidden="true">
                                ⌄
                            </span>
                        </button>

                        {profileMenuOpen && (
                            <div className="profile-menu-dropdown" role="menu">
                                <div className="profile-menu-user">
                                    <strong>{username}</strong>
                                    {user?.email && <span>{user.email}</span>}
                                </div>
                                <Link
                                    to="/profile"
                                    className="profile-menu-action"
                                    role="menuitem"
                                    onClick={() => setProfileMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/edit-profile"
                                    className="profile-menu-action"
                                    role="menuitem"
                                    onClick={() => setProfileMenuOpen(false)}
                                >
                                    Settings
                                </Link>
                                <button
                                    type="button"
                                    className="profile-menu-action profile-menu-logout"
                                    role="menuitem"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default NavBar;
