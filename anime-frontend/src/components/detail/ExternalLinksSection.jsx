import { useAnimeExternalLinks } from "../../hooks/useAnimeExternalLinks";

import "./ExternalLinksSection.css";


function ExternalLinksSection({ animeId }) {
    const {
        data: links = [],
        isLoading,
    } = useAnimeExternalLinks(animeId);

    if (!isLoading && links.length === 0) {
        return null;
    }

    return (
        <section className="external-links-section anime-section">
            <div className="detail-section-heading">
                <h2>Where to Watch</h2>
            </div>

            {isLoading ? (
                <div className="external-links-loading">
                    <span />
                    <span />
                    <span />
                </div>
            ) : (
                <div className="external-links-list">
                    {links.map((link) => (
                        <a
                            key={`${link.name}-${link.url}`}
                            className="external-link"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="external-link-info">
                                <strong>{link.name}</strong>
                                <small>{link.category}</small>
                            </span>
                            <span className="external-link-arrow" aria-hidden="true">
                                ↗
                            </span>
                        </a>
                    ))}
                </div>
            )}
        </section>
    );
}


export default ExternalLinksSection;
