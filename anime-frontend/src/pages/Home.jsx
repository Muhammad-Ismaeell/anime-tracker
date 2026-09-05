import { useMemo, useState } from "react";

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";

import PageContainer from "../components/ui/PageContainer";
import AnimeSection from "../components/ui/AnimeSection";
import EmptyState from "../components/ui/EmptyState";

import { useToggleFavorite } from "../hooks/user/useFavorites";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import { extractAnimePages } from "../utils/extractAnimePages";

function Home() {
    const [activeCategory, setActiveCategory] = useState("trending");

    const trendingQuery = useInfiniteAnime("trending");
    const seasonalQuery = useInfiniteAnime("seasonal");
    const topQuery = useInfiniteAnime("top");
    const recentlyAddedQuery = useInfiniteAnime("recentlyAdded");

    const toggleFavorite = useToggleFavorite();
    const { statusMap } = useGlobalLibrary();
    const favoriteIds = useFavoriteIds();

    const trendingAnime = useMemo(
        () => extractAnimePages(trendingQuery.data),
        [trendingQuery.data]
    );

    const seasonalAnime = useMemo(
        () => extractAnimePages(seasonalQuery.data),
        [seasonalQuery.data]
    );

    const topAnime = useMemo(
        () => extractAnimePages(topQuery.data),
        [topQuery.data]
    );

    const recentlyAddedAnime = useMemo(
        () => extractAnimePages(recentlyAddedQuery.data),
        [recentlyAddedQuery.data]
    );

    const categories = [
        { id: "trending", label: "Trending", anime: trendingAnime, to: "/trending" },
        { id: "seasonal", label: "Seasonal", anime: seasonalAnime, to: "/seasonal" },
        { id: "recentlyAdded", label: "Recently Added", anime: recentlyAddedAnime, to: "/recently-added" },
    ];

    const activeCategoryData =
        categories.find((category) => category.id === activeCategory) ?? categories[0];

    const loading =
        trendingQuery.isPending &&
        seasonalQuery.isPending &&
        topQuery.isPending &&
        recentlyAddedQuery.isPending;

    const hasAnime =
        trendingAnime.length > 0 ||
        seasonalAnime.length > 0 ||
        topAnime.length > 0 ||
        recentlyAddedAnime.length > 0;

    const allFailed =
        trendingQuery.isError &&
        seasonalQuery.isError &&
        topQuery.isError &&
        recentlyAddedQuery.isError;

    if (allFailed) {
        return (
            <PageContainer>
                <EmptyState text="Failed to load anime." />
            </PageContainer>
        );
    }

    const sectionProps = {
        statusMap,
        favoriteIds,
        toggleFavorite,
    };

    return (
        <PageContainer>
            <Helmet>
                <title>Anime Tracker</title>
                <meta
                    name="description"
                    content="Discover anime, build a personal library, and track what you watch."
                />
            </Helmet>

            <section className="home-hero">
                <div className="home-hero-inner">
                    <div className="home-hero-content">
                        <span className="home-hero-eyebrow">ANIME TRACKER</span>
                        <h1 className="home-hero-title">Discover. Track. Organize.</h1>
                        <p className="home-hero-description">
                            Discover anime, build your personal library, and keep track of what you watch.
                        </p>
                        <div className="home-hero-actions">
                            <Link to="/search" className="home-hero-primary-action">
                                Explore Anime
                            </Link>
                            <Link to="/library" className="home-hero-secondary-action">
                                My Library
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="home-discovery-controls">
                <span className="home-discovery-controls-label">DISCOVER</span>
                <div className="home-category-tabs" role="tablist" aria-label="Anime categories">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            role="tab"
                            aria-selected={activeCategory === category.id}
                            className={`home-category-tab ${activeCategory === category.id ? "active" : ""}`}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="home-loading-grid">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="home-loading-card shimmer" />
                    ))}
                </div>
            ) : hasAnime ? (
                <div className="home-catalog-sections">
                    <div className="home-discovery-grid">
                        <div className="home-discovery-main">
                            <div className="home-main-section-header">
                                <Link className="home-discovery-view-all" to={activeCategoryData.to}>
                                    View All
                                </Link>
                            </div>

                            {activeCategoryData.anime.length > 0 ? (
                                <AnimeSection
                                    title={activeCategoryData.label}
                                    animeList={activeCategoryData.anime.slice(0, 5)}
                                    showHeader={false}
                                    {...sectionProps}
                                />
                            ) : (
                                <EmptyState text={`No ${activeCategoryData.label.toLowerCase()} anime available.`} />
                            )}
                        </div>

                        {topAnime.length > 0 && (
                            <div className="home-discovery-ranking">
                                <AnimeSection
                                    title="Top Anime"
                                    animeList={topAnime}
                                    variant="ranking"
                                    viewAllTo="/top"
                                    {...sectionProps}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </PageContainer>
    );
}

export default Home;
