import { useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";
import { AnimeAPI } from "../api/anime.api";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";

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

    const { library } = useGlobalLibrary();
    const sourceAnime = useMemo(
        () =>
            library
                .map((item) => item.anime)
                .filter((anime) => anime?.id || anime?.mal_id)
                .slice(0, 6),
        [library]
    );

    const queries = useQueries({
        queries: sourceAnime.map((anime) => {
            const id = anime.id ?? anime.mal_id;
            return {
                queryKey: ["anime-news", id],
                queryFn: () => AnimeAPI.news(id),
                staleTime: 1000 * 60 * 30,
            };
        }),
    });

    const news = useMemo(() => {
        const seen = new Set();
        return queries
            .flatMap((query, index) =>
                (query.data ?? []).map((article) => ({
                    ...article,
                    animeTitle: sourceAnime[index]?.title,
                }))
            )
            .filter((article) => {
                if (!article.url || seen.has(article.url)) return false;
                seen.add(article.url);
                return true;
            })
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, 30);
    }, [queries, sourceAnime]);

    const isLoading = sourceAnime.length > 0 && queries.some((query) => query.isLoading);
    const isError = sourceAnime.length > 0 && queries.every((query) => query.isError);

    return (
        <PageContainer>
            <Helmet>
                <title>Anime News | Anime Tracker</title>
                <meta name="description" content="Read the latest news about anime in your library." />
            </Helmet>

            <div className="recommendations-header">
                <span className="recommendations-eyebrow">EXPLORE</span>
                <h1>Anime News</h1>
                <p>Latest news about the anime in your library.</p>
            </div>

            {sourceAnime.length === 0 ? (
                <EmptyState text="Add some anime to your library to see related news." icon="📰" />
            ) : isLoading ? (
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
                                <img className="news-image" src={article.image} alt="" loading="lazy" />
                            ) : (
                                <div className="news-image news-image-placeholder" />
                            )}
                            <div className="news-content">
                                <h3>{article.title}</h3>
                                <div className="news-meta">
                                    {article.animeTitle && <span>{article.animeTitle}</span>}
                                    {article.animeTitle && article.date && <span>•</span>}
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
