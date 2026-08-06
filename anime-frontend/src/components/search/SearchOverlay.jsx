import { useEffect, useState } from "react";
import { useAnimeSearch } from "../../hooks/useAnimeSearch";
import { Link } from "react-router-dom";

function SearchOverlay({ open, onClose }) {
    const [query, setQuery] = useState("");
    const [debounced, setDebounced] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounced(query.trim());
        }, 700);

        return () => clearTimeout(timer);
    }, [query]);

    const {
        data,
        isLoading
    } = useAnimeSearch(debounced);

    const results =
        data?.pages?.flatMap(page => page.items || []) || [];

    // ESC to close
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    if (!open) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.container} onClick={(e) => e.stopPropagation()}>

                {/* SEARCH INPUT */}
                <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search anime..."
                    style={styles.input}
                />

                {/* RESULTS */}
                <div style={styles.results}>
                    {isLoading && (
                        <p style={{ color: "#9ca3af" }}>Searching...</p>
                    )}

                    {!isLoading && results.length === 0 && debounced && (
                        <p style={{ color: "#9ca3af" }}>No results found</p>
                    )}

                    <div style={styles.grid}>
                        {(results || []).slice(0, 12).map((anime) => (
                            <Link
                                key={anime.id ?? anime.anime_id ?? anime.mal_id}
                                to={`/anime/${anime.id ?? anime.mal_id}`}
                                onClick={onClose}
                                style={styles.card}
                            >
                                <img
                                    src={anime.image}
                                    style={styles.image}
                                    alt={anime.title}
                                />

                                <p style={styles.title}>
                                    {anime.title}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "80px",
        zIndex: 9999
    },

    container: {
        width: "80%",
        maxWidth: "900px"
    },

    input: {
        width: "100%",
        padding: "18px",
        fontSize: "18px",
        borderRadius: "14px",
        border: "none",
        outline: "none",
        background: "#111827",
        color: "white",
        marginBottom: "20px"
    },

    results: {
        background: "#0f172a",
        borderRadius: "16px",
        padding: "20px",
        maxHeight: "70vh",
        overflowY: "auto"
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "15px"
    },

    card: {
        textDecoration: "none",
        color: "white"
    },

    image: {
        width: "100%",
        height: "200px",
        objectFit: "cover",
        borderRadius: "12px"
    },

    title: {
        fontSize: "13px",
        marginTop: "8px"
    }
};

export default SearchOverlay;