import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";
import { AnimeAPI } from "../api/anime.api";

import "../components/detail/NewsSection.css";
import "../styles/recommendations.css";

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
}

function News() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["general-news"],
        queryFn: () => AnimeAPI.generalNews(),
        staleTime: 1000 * 60 * 15,
    });

    const news = data?.items ?? [];

    return (
        <PageContainer>
            <Helmet>
                <title>Anime News | Anime Tracker</title>
                <meta
                    name="description"
                    content="Read the latest anime news from across the catalogue."
                />
            </Helmet>

            <div className="recommendations-header">
                <span className="recommendations-eyebrow">EXPLORE</span>
                <h1>Anime News</h1>
                <p>Keep up with the latest news from the anime world.</p>
            </div>

            {isLoading ? (
                <div className="news-list">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div className="news-skeleton" key={index} />
                    ))}
                </div>
            ) : isError || news.length === 0 ? (
                <EmptyState text="No anime news found right now." icon="📰" />
            ) : (
                <div className="news-list">
                    {news.map((article, index) => (
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
                                    {article.anime_title && <span>{article.anime_title}</span>}
                                    {article.anime_title && article.date && <span>•</span>}
                                    {article.date && <time>{formatDate(article.date)}</time>}
                                </div>
                            </div>
                            <span className="news-arrow" aria-hidden="true">↗</span>
                        </a>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}

export default News;
