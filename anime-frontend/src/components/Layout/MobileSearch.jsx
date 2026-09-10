import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNavbarSearch } from "../../hooks/useNavbarSearch";
import { useDebounce } from "../../hooks/useDebounce";

function MobileSearch() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const dropdownRef = useRef(null);

    const debouncedQuery = useDebounce(query, 500);
    const { data: results = [], isLoading } = useNavbarSearch(debouncedQuery);
    const hasSearchQuery = query.trim().length >= 3;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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

    return (
        <div ref={dropdownRef} className="mobile-search">
            <div className="mobile-search-box">
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
                    className="mobile-search-input"
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
                <div className="mobile-search-dropdown">
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
    );
}

export default MobileSearch;
