import { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

import { useNavbarSearch } from "../../hooks/useNavbarSearch";
import { useDebounce } from "../../hooks/useDebounce";
import "./Navbar.css";
function Navbar() {

    const navigate = useNavigate();
    const { token, logout } = useContext(AuthContext);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const debouncedQuery = useDebounce(query, 700);

    const {
        data: results = [],
        isLoading,
    } = useNavbarSearch(debouncedQuery);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (anime) => {
        setOpen(false);
        setQuery("");
        navigate(`/anime/${anime.id || anime.mal_id}`);
    };

    return (
        <div className="navbar">

            {/* LEFT */}
            <Link to="/" className="navbar-logo">
                🎬 Anime Tracker
            </Link>

            {/* CENTER SEARCH */}
            <div 
                ref={dropdownRef}
                className="navbar-search-wrapper"
            >

                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="Search anime..."
                    className="navbar-search-input"
                />

                {/* DROPDOWN */}
                {open && query.trim().length > 1 && (
                    <div className="navbar-dropdown">

                        {isLoading ? (

                            <div className="navbar-message">
                                Searching...
                            </div>

                        ) : results.length === 0 ? (

                            <div className="navbar-message">
                                No results
                            </div>

                        ) : (

                            results.slice(0, 6).map((anime) => (
                                <div
                                    key={anime.id || anime.mal_id}
                                    className="navbar-result"
                                    onClick={() => handleSelect(anime)}
                                >
                                    <img
                                        src={anime.image}
                                        alt={anime.title}
                                        className="navbar-thumb"
                                    />

                                    <div>
                                        <div className="navbar-title">
                                            {anime.title}
                                        </div>

                                        <div className="navbar-meta">
                                            {anime.type || "Anime"}
                                        </div>
                                    </div>
                                </div>
                            ))

                        )}

                        <div
                            className="navbar-view-all"
                            onClick={() => {
                                setOpen(false);
                                navigate(`/search?q=${query}`);
                            }}
                        >
                            View all results →
                        </div>

                    </div>
                )}
            </div>

            {/* RIGHT */}
            <div className="navbar-actions">

                {!token ? (
                    <>
                        <Link to="/login" className="navbar-link">Login</Link>
                        <Link to="/register" className="navbar-link">Register</Link>
                    </>
                ) : (
                    <button onClick={logout} className="navbar-button">
                        Logout
                    </button>
                )}

            </div>
        </div>
    );
}

export default Navbar;


