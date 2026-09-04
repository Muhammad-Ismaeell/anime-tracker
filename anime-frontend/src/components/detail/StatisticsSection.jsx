import { useAnimeStatistics } from "../../hooks/useAnimeStatistics";

import "./StatisticsSection.css";


const STAT_ITEMS = [
    ["watching", "Watching"],
    ["completed", "Completed"],
    ["on_hold", "On Hold"],
    ["dropped", "Dropped"],
    ["plan_to_watch", "Plan to Watch"],
];


function StatisticsSection({ animeId }) {
    const {
        data,
        isLoading,
        isError,
    } = useAnimeStatistics(animeId);

    if (!isLoading && !isError && !data?.total) {
        return null;
    }

    return (
        <section className="detail-statistics anime-section">
            <div className="detail-section-heading">
                <div>
                    <h2>Statistics</h2>
                    {!isLoading && !isError && data?.total > 0 && (
                        <span className="detail-section-subtitle">
                            {data.total.toLocaleString()} users
                        </span>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="statistics-grid">
                    {STAT_ITEMS.map(([, label]) => (
                        <div className="statistics-item statistics-skeleton" key={label}>
                            <div className="statistics-value-skeleton" />
                            <div className="statistics-label-skeleton" />
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <p className="statistics-muted">
                    Statistics could not be loaded right now.
                </p>
            ) : (
                <div className="statistics-grid">
                    {STAT_ITEMS.map(([key, label]) => (
                        <div className="statistics-item" key={key}>
                            <strong>{Number(data[key] || 0).toLocaleString()}</strong>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}


export default StatisticsSection;
