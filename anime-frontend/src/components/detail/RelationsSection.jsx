import { useAnimeRelations } from "../../hooks/useAnimeRelations";

import "./RelationsSection.css";


function formatRelation(value) {
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


function RelationsSection({ animeId }) {
    const {
        data,
        isLoading,
        isError,
    } = useAnimeRelations(animeId);

    const relations = data?.items ?? [];

    if (!isLoading && !isError && relations.length === 0) {
        return null;
    }

    return (
        <section className="detail-relations anime-section">
            <div className="detail-section-heading">
                <h2>Relations</h2>
            </div>

            {isLoading ? (
                <div className="relations-list">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div className="relation-group relation-skeleton" key={index}>
                            <div className="relation-label-skeleton" />
                            <div className="relation-links-skeleton">
                                <span />
                                <span />
                            </div>
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <p className="relations-muted">
                    Relations could not be loaded right now.
                </p>
            ) : (
                <div className="relations-list">
                    {relations.map((group) => (
                        <div className="relation-group" key={group.relation}>
                            <span className="relation-label">
                                {formatRelation(group.relation)}
                            </span>

                            <div className="relation-links">
                                {group.entries.map((entry) => (
                                    <a
                                        key={`${group.relation}-${entry.id}`}
                                        href={`/anime/${entry.id}`}
                                        className="relation-link"
                                    >
                                        <span>{entry.title}</span>
                                        {entry.type && (
                                            <small>{entry.type.toUpperCase()}</small>
                                        )}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}


export default RelationsSection;
