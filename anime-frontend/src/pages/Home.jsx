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

    const heroAnime = useMemo(() => {
        const combined = [
            ...seasonalAnime,
            ...trendingAnime,
            ...recentlyAddedAnime,
            ...topAnime,
        ];
        const seen = new Set();

        return combined
            .filter((anime) => {
                const id = anime?.mal_id ?? anime?.id;
                if (!id || !anime?.image || seen.has(String(id))) return false;
                seen.add(String(id));
                return true;
            })
            .slice(0, 5);
    }, [seasonalAnime, trendingAnime, recentlyAddedAnime, topAnime]);

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

            {heroAnime.length > 0 && (
                <section className="home-hero">
                    <div className="home-hero-inner">
                        <div className="home-hero-content">
                            <span className="home-hero-eyebrow">
                                ANIME TRACKER
                            </span>

                            <h1 className="home-hero-title">
                                Discover. Track. Organize.
                            </h1>

                            <p className="home-hero-description">
                                Find your next series, keep your personal
                                library organized, and track every anime you
                                plan to watch, are watching, or have finished.
                            </p>

                            <div className="home-hero-actions">
                                <Link
                                    to="/search"
                                    className="home-hero-primary-action"
                                >
                                    Discover Anime
                                </Link>
                                <Link
                                    to="/library"
                                    className="home-hero-secondary-action"
                                >
                                    Open My Library
                                </Link>
                            </div>
                        </div>

                        <div className="home-hero-posters" aria-label="Anime catalog preview">
                            {heroAnime.map((anime) => {
                                const id = anime.mal_id ?? anime.id;
                                return (
                                    <Link
                                        key={id}
                                        to={`/anime/${id}`}
                                        className="home-hero-poster-link"
                                        aria-label={`View ${anime.title}`}
                                    >
                                        <img
                                            src={anime.image}
                                            alt={anime.title || "Anime poster"}
                                            className="home-hero-poster"
                                            loading="eager"
                                            decoding="async"
                                        />
                                    </Link>
                                );
                            })}
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
            ) : hasAnime ? (
                <div className="home-catalog-sections">
                    <div className="home-category-row">
                        {trendingAnime.length > 0 && (
                            <AnimeSection
                                title="Trending Now"
                                animeList={trendingAnime}
                                viewAllTo="/trending"
                                {...sectionProps}
                            />
                        )}

                        {seasonalAnime.length > 0 && (
                            <AnimeSection
                                title="Current Season"
                                animeList={seasonalAnime}
                                viewAllTo="/seasonal"
                                {...sectionProps}
                            />
                        )}

                        {recentlyAddedAnime.length > 0 && (
                            <AnimeSection
                                title="Recently Added"
                                animeList={recentlyAddedAnime}
                                viewAllTo="/recently-added"
                                {...sectionProps}
                            />
                        )}
                    </div>

                    {topAnime.length > 0 && (
                        <AnimeSection
                            title="Top Anime"
                            animeList={topAnime}
                            variant="ranking"
                            viewAllTo="/top"
                            {...sectionProps}
                        />
                    )}
                </div>
            ) : null}
        </PageContainer>
    );
}

export default Home;
