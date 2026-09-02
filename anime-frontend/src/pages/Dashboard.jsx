
import { useNavigate } from "react-router-dom";

import PageContainer from "../components/ui/PageContainer";
import OptimizedImage from "../components/ui/OptimizedImage";

import { useDashboard } from "../hooks/user/useDashboard";


const actionLabels = {
    FAVORITED: "❤️ Added to favorites",
    UNFAVORITED: "💔 Removed from favorites",
    WATCHING: "👀 Started watching",
    COMPLETED: "✅ Completed",
    DROPPED: "❌ Dropped",
    ADDED: "📚 Added to library",
    REMOVED: "🗑️ Removed from library",
};


function formatDate(date) {
    if (!date) {
        return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return parsedDate.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );
}


function getAnimeProgress(progress, episodes) {
    const current = Math.max(
        Number(progress) || 0,
        0
    );

    const total = Number(episodes) || 0;

    if (total <= 0) {
        return 0;
    }

    return Math.min(
        Math.round((current / total) * 100),
        100
    );
}


function DashboardSkeleton() {
    return (
        <PageContainer>

            <div className="dashboard-skeleton">

                <div className="dashboard-skeleton-hero">
                    <div className="skeleton-line dashboard-skeleton-title" />
                    <div className="skeleton-line dashboard-skeleton-subtitle" />
                </div>


                <div className="stats-grid premium">

                    {Array.from({ length: 4 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="stat-card glass dashboard-skeleton-stat"
                            >
                                <div className="skeleton-circle" />
                                <div className="skeleton-line dashboard-skeleton-number" />
                                <div className="skeleton-line dashboard-skeleton-label" />
                            </div>
                        )
                    )}

                </div>


                <section className="section">

                    <div className="skeleton-line dashboard-skeleton-section-title" />

                    <div className="dashboard-progress glass dashboard-skeleton-progress">

                        <div className="skeleton-line dashboard-skeleton-progress-number" />

                        <div className="skeleton-line dashboard-skeleton-progress-bar" />

                        <div className="skeleton-line dashboard-skeleton-progress-description" />

                    </div>

                </section>


                <section className="section">

                    <div className="skeleton-line dashboard-skeleton-section-title" />

                    <div className="dashboard-watching-list">

                        {Array.from({ length: 3 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="dashboard-watching-card glass dashboard-skeleton-watching"
                                >
                                    <div className="dashboard-skeleton-cover" />

                                    <div className="watching-info">

                                        <div className="skeleton-line dashboard-skeleton-anime-title" />

                                        <div className="skeleton-line dashboard-skeleton-anime-meta" />

                                        <div className="skeleton-line dashboard-skeleton-anime-progress" />

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </section>

            </div>

        </PageContainer>
    );
}


function Dashboard() {

    const navigate = useNavigate();

    const {
        data,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useDashboard();


    // =========================================================
    // LOADING
    // =========================================================

    if (isLoading) {
        return <DashboardSkeleton />;
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (isError) {

        return (
            <PageContainer>

                <div className="dashboard-error glass">

                    <div className="dashboard-error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Couldn't load your dashboard
                    </h2>

                    <p>
                        Something went wrong while loading
                        your anime activity.
                    </p>

                    <button
                        type="button"
                        className="retry-btn"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        {isFetching
                            ? "Retrying..."
                            : "Try Again"}
                    </button>

                </div>

            </PageContainer>
        );
    }


    // =========================================================
    // DATA
    // =========================================================

    const stats = data ?? {};

    const progress = stats.progress ?? {};

    const currentlyWatching =
        Array.isArray(stats.currently_watching)
            ? stats.currently_watching
            : [];

    const recentActivity =
        Array.isArray(stats.recent_activity)
            ? stats.recent_activity
            : [];

    const recentlyCompleted =
        Array.isArray(stats.recently_completed)
            ? stats.recently_completed
            : [];


    const total =
        Number(stats.total) || 0;

    const watching =
        Number(stats.watching) || 0;

    const completed =
        Number(stats.completed) || 0;

    const progressPercentage =
        Math.min(
            Math.max(
                Number(progress.percentage) || 0,
                0
            ),
            100
        );
    
    const episodesWatched =
        Math.max(
            Number(progress.episodes_watched) || 0,
            0
        );

    const episodesAvailable =
        Math.max(
            Number(progress.episodes_available) || 0,
            0
        );

    const hasKnownProgressTotal =
        episodesAvailable > 0;

    // =========================================================
    // NAVIGATION
    // =========================================================

    const openAnime = (animeId) => {

        if (animeId == null) {
            return;
        }

        navigate(`/anime/${animeId}`);
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <PageContainer>

            {/* =================================================
                HERO
            ================================================= */}

            <header className="dashboard-hero">

                <div>

                    <span className="dashboard-eyebrow">
                        YOUR ANIME ACTIVITY
                    </span>

                    <h1>
                        📊 Dashboard
                    </h1>

                    <p>
                        Track your watching progress,
                        activity, and completed anime.
                    </p>

                </div>

                <button
                    type="button"
                    className="dashboard-library-btn"
                    onClick={() => navigate("/library")}
                >
                    📚 View Library
                </button>

            </header>


            {/* =================================================
                QUICK STATS
            ================================================= */}

            <section
                className="stats-grid premium"
                aria-label="Library statistics"
            >

                <button
                    type="button"
                    className="stat-card glass dashboard-stat-button"
                    onClick={() => navigate("/library")}
                >
                    <span>
                        📚
                    </span>

                    <h3>
                        {total}
                    </h3>

                    <p>
                        In Library
                    </p>
                </button>


                <button
                    type="button"
                    className="stat-card glass dashboard-stat-button"
                    onClick={() => navigate("/library?status=watching")}
                >
                    <span>
                        📺
                    </span>

                    <h3>
                        {watching}
                    </h3>

                    <p>
                        Watching
                    </p>
                </button>


                <button
                    type="button"
                    className="stat-card glass dashboard-stat-button"
                    onClick={() => navigate("/library?status=completed")}
                >
                    <span>
                        ✅
                    </span>

                    <h3>
                        {completed}
                    </h3>

                    <p>
                        Completed
                    </p>
                </button>


                <div className="stat-card glass">

                    <span>
                        📈
                    </span>

                    <h3>
                        {hasKnownProgressTotal
                            ? `${progressPercentage}%`
                            : "—"
                        }
                    </h3>

                    <p>
                        Overall Progress
                    </p>

                </div>

            </section>


            {/* =================================================
                OVERALL PROGRESS
            ================================================= */}

            <section className="section">

                <div className="section-heading">

                    <div>

                        <span className="section-eyebrow">
                            WATCHING PROGRESS
                        </span>

                        <h2>
                            📈 Your Progress
                        </h2>

                    </div>

                </div>


                <div className="dashboard-progress glass">

                    <div className="progress-header">

                        <div>

                            <h3>
                                {progress.episodes_watched || 0}
                            </h3>

                            <p>
                                Episodes watched
                            </p>

                        </div>


                        <div
                            className="progress-percentage"
                            aria-label={
                                hasKnownProgressTotal
                                    ? `${progressPercentage}% overall progress`
                                    : "Overall progress percentage unavailable"
                            }
                        >
                            {hasKnownProgressTotal
                                ? `${progressPercentage}%`
                                : "—"
                            }
                        </div>

                    </div>


                    {hasKnownProgressTotal && (
                        <div
                            className="progress-bar"
                            role="progressbar"
                            aria-valuenow={progressPercentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                        >
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${progressPercentage}%`,
                                }}
                            />
                        </div>
                    )}


                    <p className="progress-description">

                        {hasKnownProgressTotal
                            ? `${episodesWatched} of ${episodesAvailable} available episodes`
                            : episodesWatched > 0
                                ? `${episodesWatched} episodes watched • Total episode count unavailable`
                                : "Start watching anime to track your progress."
                        }

                    </p>

                </div>

            </section>


            {/* =================================================
                CONTINUE WATCHING
            ================================================= */}

            <section className="section">

                <div className="section-heading">

                    <div>

                        <span className="section-eyebrow">
                            PICK UP WHERE YOU LEFT OFF
                        </span>

                        <h2>
                            ▶️ Continue Watching
                        </h2>

                    </div>

                    {currentlyWatching.length > 0 && (
                        <button
                            type="button"
                            className="section-action"
                            onClick={() => navigate("/library")}
                        >
                            View Library →
                        </button>
                    )}

                </div>


                {currentlyWatching.length === 0 ? (

                    <div className="dashboard-empty glass">

                        <div className="dashboard-empty-icon">
                            📺
                        </div>

                        <h3>
                            Nothing to continue
                        </h3>

                        <p>
                            You're not currently watching
                            any anime.
                        </p>

                        <button
                            type="button"
                            className="dashboard-empty-action"
                            onClick={() => navigate("/search")}
                        >
                            🔎 Find Anime
                        </button>

                    </div>

                ) : (

                    <div className="dashboard-watching-list">

                        {currentlyWatching.map((anime) => {

                            const currentProgress =
                                Math.max(
                                    Number(anime.progress) || 0,
                                    0
                                );

                            const episodeCount =
                                Number(anime.episodes) || 0;

                            const percentage =
                                getAnimeProgress(
                                    currentProgress,
                                    episodeCount
                                );


                            return (
                                <button
                                    type="button"
                                    key={anime.id}
                                    className="dashboard-watching-card glass"
                                    onClick={() =>
                                        openAnime(anime.id)
                                    }
                                >

                                    <OptimizedImage
                                        src={anime.image}
                                        alt={anime.title}
                                        className="dashboard-watching-image"
                                    />


                                    <div className="watching-info">

                                        <h3>
                                            {anime.title}
                                        </h3>


                                        <p>

                                            {episodeCount > 0
                                                ? `Episode ${currentProgress} / ${episodeCount}`
                                                : `Episode ${currentProgress}`
                                            }

                                        </p>


                                        {episodeCount > 0 && (

                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                aria-valuenow={percentage}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                aria-label={`${anime.title} progress`}
                                            >
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>

                                        )}


                                        <span className="watching-continue">
                                            Continue →
                                        </span>

                                    </div>

                                </button>
                            );

                        })}

                    </div>

                )}

            </section>


            {/* =================================================
                RECENT ACTIVITY
            ================================================= */}

            <section className="section">

                <div className="section-heading">

                    <div>

                        <span className="section-eyebrow">
                            WHAT YOU'VE BEEN DOING
                        </span>

                        <h2>
                            🕒 Recent Activity
                        </h2>

                    </div>

                </div>


                {recentActivity.length === 0 ? (

                    <div className="dashboard-empty glass">

                        <div className="dashboard-empty-icon">
                            ⚡
                        </div>

                        <h3>
                            No activity yet
                        </h3>

                        <p>
                            Your anime activity will appear
                            here as you use the app.
                        </p>

                    </div>

                ) : (

                    <div className="activity-list glass">

                        {recentActivity.map((activity) => {

                            const animeId =
                                activity.anime?.id;


                            return (
                                <button
                                    type="button"
                                    key={activity.id}
                                    className="activity-item dashboard-activity-item"
                                    onClick={() =>
                                        openAnime(animeId)
                                    }
                                >

                                    <OptimizedImage
                                        src={
                                            activity.anime?.image
                                        }
                                        alt={
                                            activity.anime?.title ||
                                            "Anime"
                                        }
                                        className="activity-cover"
                                    />


                                    <div className="activity-content">

                                        <div className="activity-action">

                                            {actionLabels[
                                                activity.action
                                            ] ?? activity.action}

                                        </div>


                                        <strong>
                                            {activity.anime?.title ||
                                                "Unknown Anime"}
                                        </strong>


                                        <time
                                            dateTime={
                                                activity.created_at
                                            }
                                            className="activity-date"
                                        >
                                            {formatDate(
                                                activity.created_at
                                            )}
                                        </time>

                                    </div>


                                    <span className="activity-arrow">
                                        →
                                    </span>

                                </button>
                            );

                        })}

                    </div>

                )}

            </section>


            {/* =================================================
                RECENTLY COMPLETED
            ================================================= */}

            <section className="section">

                <div className="section-heading">

                    <div>

                        <span className="section-eyebrow">
                            YOUR LATEST FINISHES
                        </span>

                        <h2>
                            🏆 Recently Completed
                        </h2>

                    </div>

                    {recentlyCompleted.length > 0 && (
                        <button
                            type="button"
                            className="section-action"
                            onClick={() =>
                                navigate("/library?status=completed")
                            }
                        >
                            View Completed →
                        </button>
                    )}

                </div>


                {recentlyCompleted.length === 0 ? (

                    <div className="dashboard-empty glass">

                        <div className="dashboard-empty-icon">
                            🏆
                        </div>

                        <h3>
                            No completed anime yet
                        </h3>

                        <p>
                            Completed anime will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="completed-row">

                        {recentlyCompleted.map((anime) => (

                            <button
                                type="button"
                                key={anime.id}
                                className="completed-card glass"
                                onClick={() =>
                                    openAnime(anime.id)
                                }
                            >

                                <OptimizedImage
                                    src={anime.image}
                                    alt={anime.title}
                                />


                                <div>

                                    <strong>
                                        {anime.title}
                                    </strong>

                                    <p>
                                        Completed
                                    </p>

                                </div>

                            </button>

                        ))}

                    </div>

                )}

            </section>

        </PageContainer>
    );
}


export default Dashboard;
