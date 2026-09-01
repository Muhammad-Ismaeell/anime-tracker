import { useNavigate } from "react-router-dom";

import PageContainer from "../components/ui/PageContainer";
import EmptyState from "../components/ui/EmptyState";
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


function Dashboard() {

    const navigate = useNavigate();

    const {
        data,
        isLoading,
        error,
    } = useDashboard();


    // =========================================================
    // LOADING
    // =========================================================

    if (isLoading) {

        return (
            <PageContainer>

                <div className="loading">
                    Loading dashboard...
                </div>

            </PageContainer>
        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (
            <PageContainer>

                <EmptyState
                    text="Failed to load dashboard."
                />

            </PageContainer>
        );

    }


    // =========================================================
    // DATA
    // =========================================================

    const stats = data || {};

    const progress =
        stats.progress || {};

    const currentlyWatching =
        stats.currently_watching || [];

    const recentActivity =
        stats.recent_activity || [];

    const recentlyCompleted =
        stats.recently_completed || [];


    const progressPercentage =
        Math.min(
            progress.percentage || 0,
            100
        );


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <PageContainer>

            {/* =================================================
                HERO
            ================================================= */}

            <div className="dashboard-hero">

                <h1>
                    📊 Dashboard
                </h1>

                <p>
                    Your personal anime activity and progress
                </p>

            </div>


            {/* =================================================
                QUICK STATS
            ================================================= */}

            <div className="stats-grid premium">

                <div className="stat-card glass">

                    <span>
                        📚
                    </span>

                    <h3>
                        {stats.total || 0}
                    </h3>

                    <p>
                        In Library
                    </p>

                </div>


                <div className="stat-card glass">

                    <span>
                        📺
                    </span>

                    <h3>
                        {stats.watching || 0}
                    </h3>

                    <p>
                        Watching
                    </p>

                </div>


                <div className="stat-card glass">

                    <span>
                        ✅
                    </span>

                    <h3>
                        {stats.completed || 0}
                    </h3>

                    <p>
                        Completed
                    </p>

                </div>


                <div className="stat-card glass">

                    <span>
                        📈
                    </span>

                    <h3>
                        {progressPercentage}%
                    </h3>

                    <p>
                        Overall Progress
                    </p>

                </div>

            </div>


            {/* =================================================
                OVERALL PROGRESS
            ================================================= */}

            <section className="section">

                <h2>
                    📈 Your Progress
                </h2>

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


                        <div className="progress-percentage">

                            {progressPercentage}%

                        </div>

                    </div>


                    <div className="progress-bar">

                        <div
                            className="progress-bar-fill"
                            style={{
                                width: `${progressPercentage}%`,
                            }}
                        />

                    </div>


                    <p className="progress-description">

                        {progress.episodes_available > 0
                            ? `${progress.episodes_watched || 0} of ${progress.episodes_available} available episodes`
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

                    <h2>
                        ▶️ Continue Watching
                    </h2>

                </div>


                {currentlyWatching.length === 0 ? (

                    <div className="dashboard-empty glass">

                        <p>
                            You're not currently watching anything.
                        </p>

                        <span>
                            Add an anime to your library and start watching.
                        </span>

                    </div>

                ) : (

                    <div className="dashboard-watching-list">

                        {currentlyWatching.map((anime) => {

                            const episodeCount =
                                anime.episodes || 0;

                            const currentProgress =
                                anime.progress || 0;

                            const percentage =
                                episodeCount > 0
                                    ? Math.min(
                                        Math.round(
                                            (
                                                currentProgress /
                                                episodeCount
                                            ) * 100
                                        ),
                                        100
                                    )
                                    : 0;


                            return (

                                <article
                                    key={anime.id}
                                    className="dashboard-watching-card glass"
                                    onClick={() =>
                                        navigate(
                                            `/anime/${anime.id}`
                                        )
                                    }
                                >

                                    <OptimizedImage
                                        src={anime.image}
                                        alt={anime.title}
                                    />


                                    <div className="watching-info">

                                        <h3>
                                            {anime.title}
                                        </h3>

                                        <p>

                                            Episode {currentProgress}

                                            {episodeCount
                                                ? ` / ${episodeCount}`
                                                : ""
                                            }

                                        </p>


                                        <div className="progress-bar">

                                            <div
                                                className="progress-bar-fill"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                </article>

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

                    <h2>
                        🕒 Recent Activity
                    </h2>

                </div>


                {recentActivity.length === 0 ? (

                    <div className="dashboard-empty glass">

                        <p>
                            No activity yet.
                        </p>

                        <span>
                            Your anime activity will appear here.
                        </span>

                    </div>

                ) : (

                    <div className="activity-list glass">

                        {recentActivity.map((activity) => (

                            <article
                                key={activity.id}
                                className="activity-item"
                                onClick={() =>
                                    navigate(
                                        `/anime/${activity.anime.id}`
                                    )
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

                                        {new Date(
                                            activity.created_at
                                        ).toLocaleDateString(
                                            undefined,
                                            {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            }
                                        )}

                                    </time>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </section>


            {/* =================================================
                RECENTLY COMPLETED
            ================================================= */}

            {recentlyCompleted.length > 0 && (

                <section className="section">

                    <div className="section-heading">

                        <h2>
                            🏆 Recently Completed
                        </h2>

                    </div>


                    <div className="completed-row">

                        {recentlyCompleted.map((anime) => (

                            <article
                                key={anime.id}
                                className="completed-card glass"
                                onClick={() =>
                                    navigate(
                                        `/anime/${anime.id}`
                                    )
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

                            </article>

                        ))}

                    </div>

                </section>

            )}


        </PageContainer>
    );
}


export default Dashboard;