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

function getCurrentSeason() {
    const date = new Date();
    const month = date.getMonth() + 1;

    if (month <= 3) return { year: date.getFullYear(), season: "winter" };
    if (month <= 6) return { year: date.getFullYear(), season: "spring" };
    if (month <= 9) return { year: date.getFullYear(), season: "summer" };
    return { year: date.getFullYear(), season: "fall" };
}

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

    const { year: currentYear, season: currentSeason } = useMemo(
        getCurrentSeason,
        []
    );

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
                        viewAllTo="/anime?order_by=popularity&sort=asc"
                        {...sectionProps}
                    />

                    <AnimeSection
                        title="Current Season"
                        animeList={seasonalAnime}
                        viewAllTo={`/anime?season=${currentSeason}&year=${currentYear}`}
                        {...sectionProps}
                    />

                    <AnimeSection
                        title="Recently Added"
                        animeList={recentlyAddedAnime}
                        viewAllTo="/anime"
                        {...sectionProps}
                    />

                    <AnimeSection
                        title="Top Anime"
                        animeList={topAnime}
                        variant="ranking"
                        viewAllTo="/anime?order_by=score&sort=desc"
                        {...sectionProps}
                    />
                </div>
            )}
        </PageContainer>
    );
}

export default Home;
