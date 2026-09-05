import { useEffect, useMemo, useRef, useState } from "react";
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

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getSearchScore(article, query) {
    if (!query) return 0;

    const normalizedQuery = normalizeText(query);
    const title = normalizeText(article.title);

    if (title === normalizedQuery) return 0;
    if (title.startsWith(normalizedQuery)) return 1;
    return 2;
}

function News() {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [period, setPeriod] = useState("latest");
    const loadMoreRef = useRef(null);
    const canLoadMoreRef = useRef(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const newsQuery = useInfiniteQuery({
        queryKey: ["general-news", query],
        queryFn: ({ pageParam }) => AnimeAPI.generalNews(pageParam, { q: query }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.has_next ? lastPage.page + 1 : undefined,
        staleTime: 1000 * 60 * 15,
    });

    const allNews = (newsQuery.data?.pages ?? []).flatMap((page) => page.items ?? []);
    const news = useMemo(() => {
        let filtered = allNews;

        if (period === "week") {
            const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
            filtered = filtered.filter((article) => {
                const timestamp = article.date ? new Date(article.date).getTime() : 0;
                return timestamp >= cutoff;
            });
        }

        if (!query) return filtered;

        const normalizedQuery = normalizeText(query);
        filtered = filtered.filter((article) => normalizeText(article.title).includes(normalizedQuery));

        return [...filtered].sort(
            (first, second) => getSearchScore(first, query) - getSearchScore(second, query)
        );
    }, [allNews, period, query]);

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

    const handleSearch = (event) => {
        event.preventDefault();
        setQuery(search.trim());
    };

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
                <form className="discovery-search" onSubmit={handleSearch}>
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search anime news..."
                        aria-label="Search anime news"
                    />
                    <button type="submit">Search</button>
                </form>
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
                    {Array.from({ length: 8 }).map((_, index) => <div className="news-skeleton" key={index} />)}
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
