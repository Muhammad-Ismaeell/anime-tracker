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
                    content="Discover featured, trending, seasonal, top, and recently added anime."
                />
            </Helmet>

            {!loading && featuredAnime && (
                <section className="home-hero">
                    <div
                        className="home-hero-background"
                        style={{
                            backgroundImage: `url("${featuredAnime.image}")`,
                        }}
                        aria-hidden="true"
                    />

                    <div className="home-hero-overlay" aria-hidden="true" />

                    <div className="home-hero-inner">
                        <div className="home-hero-poster-container">
                            <Link
                                to={`/anime/${featuredAnime.mal_id ?? featuredAnime.id}`}
                                className="home-hero-poster-link"
                                aria-label={`View ${featuredAnime.title}`}
                            >
                                <img
                                    src={featuredAnime.image}
                                    alt={featuredAnime.title || "Featured anime"}
                                    className="home-hero-poster"
                                    loading="eager"
                                    decoding="async"
                                />
                            </Link>
                        </div>

                        <div className="home-hero-content">
                            <span className="home-hero-eyebrow">✦ FEATURED</span>

                            <h1 className="home-hero-title">
                                {featuredAnime.title}
                            </h1>

                            <div className="home-hero-meta">
                                {featuredAnime.score > 0 && (
                                    <span>
                                        ⭐ {Number(featuredAnime.score).toFixed(1)}
                                    </span>
                                )}

                                {featuredAnime.type && (
                                    <span>{featuredAnime.type}</span>
                                )}

                                {featuredAnime.year && (
                                    <span>{featuredAnime.year}</span>
                                )}
                            </div>

                            {featuredAnime.genres?.length > 0 && (
                                <div className="home-hero-genres">
                                    {featuredAnime.genres
                                        .slice(0, 4)
                                        .map((genre) => (
                                            <span key={genre}>{genre}</span>
                                        ))}
                                </div>
                            )}

                            <p className="home-hero-description">
                                {featuredAnime.synopsis ||
                                    "Discover this anime and add it to your library."}
                            </p>

                            <div className="home-hero-actions">
                                <Link
                                    to={`/anime/${featuredAnime.mal_id ?? featuredAnime.id}`}
                                    className="home-hero-primary-action"
                                >
                                    View Anime
                                </Link>
                            </div>
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
                        {...sectionProps}
                    />

                    <AnimeSection
                        title="Current Season"
                        animeList={seasonalAnime}
                        {...sectionProps}
                    />

                    <AnimeSection
                        title="Top Anime"
                        animeList={topAnime}
                        {...sectionProps}
                    />

                    <AnimeSection
                        title="Recently Added"
                        animeList={recentlyAddedAnime}
                        {...sectionProps}
                    />
                </div>
            )}
        </PageContainer>
    );
}

export default Home;
