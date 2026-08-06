import PageContainer from "../components/ui/PageContainer";
import { useDashboard } from "../hooks/user/useDashboard";

function Dashboard() {

    const {
        data,
        isLoading,
        error
    } = useDashboard();

    if (isLoading) {
        return (
            <PageContainer>
                <div className="loading">Loading...</div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <EmptyState text="Failed to load dashboard." />
            </PageContainer>
        );
    }

    const stats = data || {};

    return (
        <PageContainer>

            {/* HERO */}
            <div className="dashboard-hero">
                <h1>📊 Dashboard</h1>
                <p>Your anime progress at a glance</p>
            </div>

            {/* STATS ONLY */}
            <div className="stats-grid premium">

                <div className="stat-card glass">
                    ❤️
                    <h3>{stats.favorites || 0}</h3>
                    <p>Favorites</p>
                </div>

                <div className="stat-card glass">
                    📺
                    <h3>{stats.watching || 0}</h3>
                    <p>Watching</p>
                </div>

                <div className="stat-card glass">
                    ✅
                    <h3>{stats.completed || 0}</h3>
                    <p>Completed</p>
                </div>

            </div>

            {/* OPTIONAL: quick insight instead of lists */}
            <div className="section">

                <h2>📈 Overview</h2>

                <div className="overview-box">

                    <p>
                        You are currently watching <strong>{stats.watching || 0}</strong> anime.
                    </p>

                    <p>
                        You have completed <strong>{stats.completed || 0}</strong> anime.
                    </p>

                    <p>
                        Keep going — you're building a strong library 💪
                    </p>

                </div>

            </div>

        </PageContainer>
    );
}

export default Dashboard;