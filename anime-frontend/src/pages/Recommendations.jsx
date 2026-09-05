import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import EmptyState from "../components/ui/EmptyState";
import OptimizedImage from "../components/ui/OptimizedImage";
import PageContainer from "../components/ui/PageContainer";
import { AnimeAPI } from "../api/anime.api";

import "../styles/infinite-scroll.css";
import "../styles/recommendations.css";

function Recommendations() {
    const loadMoreRef = useRef(null);
    const canLoadMoreRef = useRef(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const query = useInfiniteQuery({
        queryKey: ["general-recommendations"],
        queryFn: ({ pageParam }) => AnimeAPI.generalRecommendations(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.has_next ? lastPage.page + 1 : undefined,
        staleTime: 1000 * 60 * 30,
    });

    const recommendations = (query.data?.pages ?? [])
        .flatMap((page) => page.items ?? []);

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
                    query.hasNextPage &&
                    !query.isFetchingNextPage
                ) {
                    canLoadMoreRef.current = false;
                    query.fetchNextPage();
                }
            },
            { rootMargin: "100px" }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage]);

    return (
        <PageContainer>
            <Helmet>
                <title>Recommendations | Anime Tracker</title>
                <meta name="description" content="Discover anime recommendations from across the catalogue." />
            </Helmet>

            <div className="recommendations-header">
                <span className="recommendations-eyebrow">DISCOVER</span>
                <h1>Recommendations</h1>
                <p>See what the anime community recommends together.</p>
            </div>

            {query.isLoading ? (
                <div className="recommendations-list">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div className="recommendation-skeleton" key={index} />
                    ))}
                </div>
            ) : query.isError || recommendations.length === 0 ? (
                <EmptyState text="No recommendations found right now." icon="✨" />
            ) : (
                <>
                    <div className="recommendations-list">
                        {recommendations.map((recommendation) => {
                            const [first, second] = recommendation.entries ?? [];

                            if (!first || !second) {
                                return null;
                            }

                            return (
                                <article className="recommendation-card" key={recommendation.id}>
                                    <div className="recommendation-pair">
                                        <Link to={`/anime/${first.id}`} className="recommendation-anime">
                                            <OptimizedImage
                                                src={first.image || "/no-image.png"}
                                                alt={first.title}
                                                loading="lazy"
                                            />
                                            <span>{first.title}</span>
                                        </Link>

                                        <span className="recommendation-arrow" aria-hidden="true">→</span>

                                        <Link to={`/anime/${second.id}`} className="recommendation-anime">
                                            <OptimizedImage
                                                src={second.image || "/no-image.png"}
                                                alt={second.title}
                                                loading="lazy"
                                            />
                                            <span>{second.title}</span>
                                        </Link>
                                    </div>

                                    {recommendation.content && (
                                        <p className="recommendation-content">“{recommendation.content}”</p>
                                    )}

                                    {(recommendation.user || recommendation.date) && (
                                        <div className="recommendation-meta">
                                            {recommendation.user && <span>Recommended by {recommendation.user}</span>}
                                            {recommendation.date && (
                                                <time dateTime={recommendation.date}>
                                                    {new Date(recommendation.date).toLocaleDateString()}
                                                </time>
                                            )}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>

                    {query.hasNextPage && (
                        <div ref={loadMoreRef} className="infinite-scroll-sentinel" aria-hidden="true">
                            {query.isFetchingNextPage && (
                                <div className="recommendations-list infinite-scroll-skeleton-grid">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <div className="recommendation-skeleton" key={index} />
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

export default Recommendations;
