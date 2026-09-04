import { useAnimeThemes } from "../../hooks/useAnimeThemes";

import "./ThemesSection.css";


function ThemeList({ title, themes }) {
    if (!themes.length) {
        return null;
    }

    return (
        <div className="themes-column">
            <h3>{title}</h3>

            <div className="themes-list">
                {themes.map((theme, index) => (
                    <div className="theme-row" key={`${title}-${index}-${theme}`}>
                        <span className="theme-index">{index + 1}</span>
                        <span className="theme-name">{theme}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}


function ThemesSection({ animeId }) {
    const {
        data,
        isLoading,
        isError,
    } = useAnimeThemes(animeId);

    const openings = Array.isArray(data?.openings) ? data.openings : [];
    const endings = Array.isArray(data?.endings) ? data.endings : [];

    if (!isLoading && !isError && openings.length === 0 && endings.length === 0) {
        return null;
    }

    return (
        <section className="detail-themes anime-section">
            <div className="detail-section-heading">
                <div>
                    <h2>Themes</h2>
                    <span className="detail-section-subtitle">
                        Opening &amp; ending themes
                    </span>
                </div>
            </div>

            {isLoading ? (
                <div className="themes-grid">
                    <div className="themes-skeleton" />
                    <div className="themes-skeleton" />
                </div>
            ) : isError ? (
                <p className="themes-muted">
                    Themes could not be loaded right now.
                </p>
            ) : (
                <div className="themes-grid">
                    <ThemeList title="Opening Themes" themes={openings} />
                    <ThemeList title="Ending Themes" themes={endings} />
                </div>
            )}
        </section>
    );
}


export default ThemesSection;
