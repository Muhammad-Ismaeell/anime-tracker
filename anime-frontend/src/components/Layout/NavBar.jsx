import { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

import { useNavbarSearch } from "../../hooks/useNavbarSearch";
import { useDebounce } from "../../hooks/useDebounce";

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
        <div style={styles.navbar}>

            {/* LEFT */}
            <Link to="/" style={styles.logo}>
                🎬 Anime App
            </Link>

            {/* CENTER SEARCH */}
            <div ref={dropdownRef} style={styles.searchWrapper}>

                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="Search anime..."
                    style={styles.input}
                />

                {/* DROPDOWN */}
                {open && query.trim().length > 1 && (
                    <div style={styles.dropdown}>

                        {isLoading ? (

                            <div style={styles.noResult}>
                                Searching...
                            </div>

                        ) : results.length === 0 ? (

                            <div style={styles.noResult}>
                                No results
                            </div>

                        ) : (

                            results.slice(0, 6).map((anime) => (
                                <div
                                    key={anime.id || anime.mal_id}
                                    style={styles.item}
                                    onClick={() => handleSelect(anime)}
                                >
                                    <img
                                        src={anime.image}
                                        alt={anime.title}
                                        style={styles.thumb}
                                    />

                                    <div>
                                        <div style={styles.title}>
                                            {anime.title}
                                        </div>

                                        <div style={styles.meta}>
                                            {anime.type || "Anime"}
                                        </div>
                                    </div>
                                </div>
                            ))

                        )}

                        <div
                            style={styles.fullResults}
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
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>

                {!token ? (
                    <>
                        <Link to="/login" style={{ color: "white" }}>Login</Link>
                        <Link to="/register" style={{ color: "white" }}>Register</Link>
                    </>
                ) : (
                    <button onClick={logout} style={styles.logout}>
                        Logout
                    </button>
                )}

            </div>
        </div>
    );
}

export default Navbar;


const styles = {

    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 20px",
        background: "#0f172a",
        color: "white",
        borderBottom: "1px solid #1f2937",
        position: "relative",
        zIndex: 1000
    },

    logo: {
        color: "white",
        textDecoration: "none",
        fontWeight: "bold"
    },

    searchWrapper: {
        position: "relative",
        width: "400px"
    },

    input: {
        width: "100%",
        padding: "10px 14px",
        borderRadius: "10px",
        border: "1px solid #333",
        background: "#111",
        color: "white"
    },

    dropdown: {
        position: "absolute",
        top: "45px",
        left: 0,
        right: 0,
        background: "#111827",
        border: "1px solid #2d2d2d",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
    },

    item: {
        display: "flex",
        gap: "10px",
        padding: "10px",
        cursor: "pointer",
        alignItems: "center"
    },

    thumb: {
        width: "40px",
        height: "50px",
        objectFit: "cover",
        borderRadius: "6px"
    },

    title: {
        fontSize: "14px",
        color: "white"
    },

    meta: {
        fontSize: "12px",
        color: "#9ca3af"
    },

    noResult: {
        padding: "10px",
        color: "#999"
    },

    fullResults: {
        padding: "10px",
        textAlign: "center",
        borderTop: "1px solid #2d2d2d",
        cursor: "pointer",
        color: "#a78bfa"
    },

    logout: {
        background: "#7c3aed",
        border: "none",
        padding: "8px 12px",
        borderRadius: "8px",
        color: "white",
        cursor: "pointer"
    }
};