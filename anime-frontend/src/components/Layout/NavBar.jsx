import {
    useState,
    useRef,
    useEffect,
    useContext,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    AuthContext,
} from "../../context/AuthContext";

import {
    useNavbarSearch,
} from "../../hooks/useNavbarSearch";

import {
    useDebounce,
} from "../../hooks/useDebounce";

import "./Navbar.css";


function NavBar({
    onMenuToggle = () => {},
    sidebarOpen = false,
}) {
    const navigate = useNavigate();

    const {
        isAuthenticated,
        user,
    } = useContext(AuthContext);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const debouncedQuery =
        useDebounce(query, 500);

    const {
        data: results = [],
        isLoading,
    } = useNavbarSearch(
        debouncedQuery
    );

    const dropdownRef = useRef(null);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target
                )
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);


    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);


    const handleSelect = (anime) => {
        const id =
            anime?.id ??
            anime?.mal_id;

        if (id == null) {
            return;
        }

        setOpen(false);
        setQuery("");

        navigate(`/anime/${id}`);
    };


    const handleSearchSubmit = () => {
        const value = query.trim();

        if (!value) {
            return;
        }

        setOpen(false);

        navigate(
            `/search?q=${encodeURIComponent(value)}`
        );
    };


    const hasSearchQuery =
        query.trim().length >= 3;


    return (
        <header className="navbar">
            {/* LEFT */}
            <div className="navbar-left">
                <button
                    type="button"
                    className="navbar-menu-button"
                    onClick={onMenuToggle}
                    aria-label={
                        sidebarOpen
                            ? "Close navigation"
                            : "Open navigation"
                    }
                    aria-expanded={sidebarOpen}
                >
                    {sidebarOpen ? "✕" : "☰"}
                </button>

                <Link
                    to="/"
                    className="navbar-logo"
                    aria-label="Anime Tracker home"
                >
                    <span className="logo-icon">
                        🎬
                    </span>

                    <span className="navbar-logo-text">
                        Anime Tracker
                    </span>
                </Link>
            </div>


            {/* CENTER SEARCH */}
            <div
                ref={dropdownRef}
                className="navbar-search-wrapper"
            >
                <div className="navbar-search">
                    <span
                        className="navbar-search-icon"
                        aria-hidden="true"
                    >
                        🔎
                    </span>

                    <input
                        value={query}
                        onChange={(event) => {
                            setQuery(
                                event.target.value
                            );
                            setOpen(true);
                        }}
                        onFocus={() => {
                            if (query.trim()) {
                                setOpen(true);
                            }
                        }}
                        onKeyDown={(event) => {
                            if (
                                event.key ===
                                "Enter"
                            ) {
                                handleSearchSubmit();
                            }

                            if (
                                event.key ===
                                "Escape"
                            ) {
                                setOpen(false);
                            }
                        }}
                        placeholder="Search anime..."
                        className="navbar-search-input"
                        aria-label="Search anime"
                        aria-expanded={
                            open &&
                            hasSearchQuery
                        }
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
                            <div className="navbar-message">
                                Searching anime...
                            </div>
                        ) : results.length === 0 ? (
                            <div className="navbar-message">
                                No anime found
                            </div>
                        ) : (
                            results
                                .slice(0, 6)
                                .map((anime) => (
                                    <button
                                        type="button"
                                        key={
                                            anime.id ??
                                            anime.mal_id
                                        }
                                        className="navbar-result"
                                        onClick={() =>
                                            handleSelect(
                                                anime
                                            )
                                        }
                                    >
                                        <img
                                            src={
                                                anime.image
                                            }
                                            alt=""
                                            className="navbar-thumb"
                                        />

                                        <span className="navbar-result-info">
                                            <span className="navbar-title">
                                                {
                                                    anime.title
                                                }
                                            </span>

                                            <span className="navbar-meta">
                                                {
                                                    anime.type
                                                }
                                            </span>
                                        </span>
                                    </button>
                                ))
                        )}

                        {!isLoading &&
                            results.length > 0 && (
                                <button
                                    type="button"
                                    className="navbar-view-all"
                                    onClick={
                                        handleSearchSubmit
                                    }
                                >
                                    View all results
                                    <span>
                                        →
                                    </span>
                                </button>
                            )}
                    </div>
                )}
            </div>


            {/* RIGHT */}
            <div className="navbar-right">
                {!isAuthenticated ? (
                    <>
                        <Link
                            to="/login"
                            className="navbar-login"
                        >
                            Sign in
                        </Link>

                        <Link
                            to="/register"
                            className="navbar-register"
                        >
                            Get Started
                        </Link>
                    </>
                ) : (
                    <Link
                        to="/profile"
                        className="navbar-profile"
                    >
                        <span className="profile-avatar-mini">
                            {user?.username
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "👤"}
                        </span>

                        <span className="navbar-profile-name">
                            {user?.username ||
                                "Profile"}
                        </span>
                    </Link>
                )}
            </div>
        </header>
    );
}


export default NavBar;