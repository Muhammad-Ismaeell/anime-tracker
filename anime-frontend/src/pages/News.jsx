import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";
import { AnimeAPI } from "../api/anime.api";

import "../components/detail/NewsSection.css";
import "../styles/infinite-scroll.css";
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
    const [period, setPeriod] = useState("latest");
    const loadMoreRef = useRef(null);
    const canLoadMoreRef = useRef(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const newsQuery = useInfiniteQuery({
        queryKey: ["general-news"],
        queryFn: ({ pageParam }) => AnimeAPI.generalNews(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.has_next ? lastPage.page + 1 : undefined,
        staleTime: 1000 * 60 * 15,
    });

    const allNews = (newsQuery.data?.pages ?? []).flatMap((page) => page.items ?? []);
    const news = period === "week"
        ? allNews.filter((article) => {
            const timestamp = article.date ? new Date(article.date).getTime() : 0;
            return timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000;
        })
        : allNews;

    useEffect(() => {
        const element = loadMoreRef.current;

        if (!element) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) {
                    canLoadMoreRef.current = true;
                    return;
                }

                if (
                    canLoadMoreRef.current &&
                    newsQuery.hasNextPage &&
                    !newsQuery.isFetchingNextPage
                ) {
                    canLoadMoreRef.current = false;
                    newsQuery.fetchNextPage();
                }
            },
            { rootMargin: "100px" }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [newsQuery.fetchNextPage, newsQuery.hasNextPage, newsQuery.isFetchingNextPage]);

    return (
        <PageContainer>
            <Helmet>
                <title>Anime News | Anime Tracker</title>
                <meta name="description" content="Read the latest anime news from across the catalogue." />
            </Helmet>

            <div className="recommendations-header">
                <span className="recommendations-eyebrow">EXPLORE</span>
                <h1>Anime News</h1>
                <p>Keep up with the latest news from the anime world.</p>
            </div>

            <div className="discovery-toolbar">
                <div className="discovery-sort" role="group" aria-label="News period">
                    <button
                        type="button"
                        className={period === "latest" ? "active" : ""}
                        onClick={() => setPeriod("latest")}
                    >
                        Latest
                    </button>
                    <button
                        type="button"
                        className={period === "week" ? "active" : ""}
                        onClick={() => setPeriod("week")}
                    >
                        This Week
                    </button>
                </div>
            </div>

            {newsQuery.isLoading ? (
                <div className="news-list">
                    {Array.from({ length: 6 }).map((_, index) => <div className="news-skeleton" key={index} />)}
                </div>
            ) : newsQuery.isError || news.length === 0 ? (
                <EmptyState text="No anime news found." icon="📰" />
            ) : (
                <>
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
                                        {article.anime_title && <span>{article.anime_title}</span>}
                                        {article.anime_title && article.date && <span>•</span>}
                                        {article.date && <time>{formatDate(article.date)}</time>}
                                    </div>
                                </div>
                                <span className="news-arrow" aria-hidden="true">↗</span>
                            </a>
                        ))}
                    </div>

                    {newsQuery.hasNextPage && (
                        <div ref={loadMoreRef} className="infinite-scroll-sentinel" aria-hidden="true">
                            {newsQuery.isFetchingNextPage && (
                                <div className="news-list infinite-scroll-skeleton-grid">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div className="news-skeleton" key={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </PageContainer>
    );
}

export default News;
