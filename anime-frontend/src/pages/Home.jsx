import { useMemo } from "react";

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { useInfiniteAnime } from "../hooks/useInfintiteAnime";

import PageContainer from "../components/ui/PageContainer";
import AnimeSection from "../components/ui/AnimeSection";
import EmptyState from "../components/ui/EmptyState";
import DiscoverGenres from "../components/ui/DiscoverGenres";

import { useToggleFavorite } from "../hooks/user/useFavorites";
import { useFavoriteIds } from "../hooks/user/useFavoriteIds";
import { useGlobalLibrary } from "../hooks/useGlobalLibrary";
import { extractAnimePages } from "../utils/extractAnimePages";

function Home() {
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

    const featuredAnime = useMemo(() => {
        const seasonalFeatured = seasonalAnime.find(
            (anime) => anime?.image
        );

        if (seasonalFeatured) {
            return seasonalFeatured;
        }

        return topAnime.find((anime) => anime?.image);
    }, [seasonalAnime, topAnime]);

    const loading =
        trendingQuery.isPending ||
        seasonalQuery.isPending ||
        topQuery.isPending ||
        recentlyAddedQuery.isPending;

    const error =
        trendingQuery.error ||
        seasonalQuery.error ||
        topQuery.error ||
        recentlyAddedQuery.error;

    if (error) {
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
                    content="Discover anime, build your library, track your progress, and keep up with what you want to watch."
                />
            </Helmet>

            {!loading && featuredAnime && (
                <section className="home-hero">
                    <div className="home-hero-inner">
                        <div className="home-hero-content">
                            <span className="home-hero-eyebrow">
                                YOUR ANIME TRACKER
                            </span>

                            <h1 className="home-hero-title">
                                Keep your anime life organized.
                            </h1>

                            <p className="home-hero-description">
                                Discover new series, keep a personal library,
                                track what you are watching, and remember what
                                you want to watch next.
                            </p>

                            <div className="home-hero-actions">
                                <Link
                                    to="/search"
                                    className="home-hero-primary-action"
                                >
                                    Browse Anime
                                </Link>

                                <Link
                                    to="/library"
                                    className="home-hero-secondary-action"
                                >
                                    My Library
                                </Link>
                            </div>
                        </div>

                        <div className="home-hero-feature">
                            <span className="home-hero-feature-label">
                                FEATURED IN CATALOG
                            </span>

                            <Link
                                to={`/anime/${featuredAnime.mal_id ?? featuredAnime.id}`}
                                className="home-hero-feature-card"
                                aria-label={`View ${featuredAnime.title}`}
                            >
                                <img
                                    src={featuredAnime.image}
                                    alt={featuredAnime.title || "Featured anime"}
                                    className="home-hero-poster"
                                    loading="eager"
                                    decoding="async"
                                />

                                <div className="home-hero-feature-info">
                                    <strong>{featuredAnime.title}</strong>

                                    <span>
                                        {featuredAnime.type || "Anime"}
                                        {featuredAnime.year
                                            ? ` • ${featuredAnime.year}`
                                            : ""}
                                    </span>

                                    {Number(featuredAnime.score) > 0 && (
                                        <span>
                                            ⭐ {Number(featuredAnime.score).toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <DiscoverGenres />

            {loading ? (
                <div className="home-loading-grid">
                    {Array.from({ length: 24 }).map((_, index) => (
                        <div
                            key={index}
                            className="home-loading-card shimmer"
                        />
                    ))}
                </div>
            ) : (
                <div className="home-catalog-sections">
                    <AnimeSection
                        title="Trending Now"
                        animeList={trendingAnime}
                        viewAllTo="/trending"
                        {...sectionProps}
                    />

                    <AnimeSection
                        title="Current Season"
                        animeList={seasonalAnime}
                        viewAllTo="/seasonal"
                        {...sectionProps}
                    />

                    <AnimeSection
                        title="Recently Added"
                        animeList={recentlyAddedAnime}
                        viewAllTo="/recently-added"
                        {...sectionProps}
                    />

                    <AnimeSection
                        title="Top Anime"
                        animeList={topAnime}
                        variant="ranking"
                        viewAllTo="/top"
                        {...sectionProps}
                    />
                </div>
            )}
        </PageContainer>
    );
}

export default Home;
