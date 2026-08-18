import { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

import { useNavbarSearch } from "../../hooks/useNavbarSearch";
import { useDebounce } from "../../hooks/useDebounce";
import "./Navbar.css";
function Navbar() {

    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const debouncedQuery = useDebounce(query, 500);

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

    useEffect(()=>{

        const handleEscape = (e)=>{

            if(e.key === "Escape"){
                setOpen(false);
            }

        };


        window.addEventListener(
            "keydown",
            handleEscape
        );


        return ()=>{

            window.removeEventListener(
                "keydown",
                handleEscape
            );

        };


    },[]);

    const handleSelect = (anime) => {

        const id =
            anime.id ||
            anime.mal_id;


        if(!id) return;


        setOpen(false);

        setQuery("");


        navigate(`/anime/${id}`);

    };

    return (
        <div className="navbar">

            <div className="navbar-left">

                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🎬</span>
                    Anime Tracker
                </Link>

            </div>


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

                    onKeyDown={(e)=>{

                        if(
                            e.key === "Enter" &&
                            query.trim()
                        ){

                            setOpen(false);

                            navigate(
                                `/search?q=${query.trim()}`
                            );

                        }

                    }}

                    placeholder="🔎 Search anime..."

                    className="navbar-search-input"
                />

                {/* DROPDOWN */}
                {open && query.trim().length >= 3 && (
                    <div className="navbar-dropdown">

                        {isLoading ? (

                            <div className="navbar-message">
                                🔎 Searching anime...
                            </div>

                        ) : results.length === 0 ? (

                            <div className="navbar-message">
                                😢 No anime found
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
                                navigate(
                                    `/search?q=${query.trim()}`
                                );
                            }}
                        >
                            View all results →
                        </div>

                    </div>
                )}
            </div>

            {/* RIGHT */}
            <div className="navbar-right">

                {!token ? (
                    <>
                        <Link
                            to="/login"
                            className="navbar-login"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="navbar-register"
                        >
                            Create Account
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            to="/profile"
                            className="navbar-profile"
                        >
                            👤 Profile
                        </Link>
                    </>
                )}

            </div>
        </div>
    );
}

export default Navbar;


