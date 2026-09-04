import { useAnimeNews } from "../../hooks/useAnimeNews";

import "./NewsSection.css";


function formatDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
}


function NewsSection({ animeId }) {
    const {
        data: news = [],
        isLoading,
        isError,
    } = useAnimeNews(animeId);

    if (!isLoading && (isError || news.length === 0)) {
        return null;
    }

    return (
        <section className="detail-news anime-section">
            <div className="detail-section-heading">
                <div>
                    <h2>News</h2>
                    <span className="detail-section-subtitle">
                        Latest news about this anime
                    </span>
                </div>
            </div>

            {isLoading ? (
                <div className="news-list">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div className="news-skeleton" key={index} />
                    ))}
                </div>
            ) : (
                <div className="news-list">
                    {news.slice(0, 10).map((article, index) => (
                        <a
                            className="news-item"
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={`${article.url}-${index}`}
                        >
                            {article.image ? (
                                <img
                                    className="news-image"
                                    src={article.image}
                                    alt=""
                                    loading="lazy"
                                />
                            ) : (
                                <div className="news-image news-image-placeholder" />
                            )}

                            <div className="news-content">
                                <h3>{article.title}</h3>

                                <div className="news-meta">
                                    {article.author && <span>{article.author}</span>}
                                    {article.author && article.date && <span>•</span>}
                                    {article.date && <time>{formatDate(article.date)}</time>}
                                </div>
                            </div>

                            <span className="news-arrow" aria-hidden="true">
                                ↗
                            </span>
                        </a>
                    ))}
                </div>
            )}
        </section>
    );
}


export default NewsSection;
