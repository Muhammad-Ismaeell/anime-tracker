import { useMemo } from "react";

import { useAnimeEpisodes } from "../../hooks/useAnimeEpisodes";
import { useGlobalLibrary } from "../../hooks/useGlobalLibrary";

import "./EpisodesSection.css";


function EpisodesSection({ animeId }) {
    const {
        data,
        isLoading,
        isError,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useAnimeEpisodes(animeId);

    const { libraryMap } = useGlobalLibrary();

    const watchedProgress = useMemo(() => {
        if (!(libraryMap instanceof Map)) {
            return 0;
        }

        return Number(
            libraryMap.get(String(animeId))?.progress ?? 0
        ) || 0;
    }, [libraryMap, animeId]);

    const episodes = useMemo(
        () => data?.pages?.flatMap((page) => page?.items ?? []) ?? [],
        [data]
    );

    if (!isLoading && !isError && episodes.length === 0) {
        return null;
    }

    return (
        <section className="detail-episodes anime-section">
            <div className="detail-section-heading">
                <div>
                    <h2>Episodes</h2>
                    <span className="detail-section-subtitle">
                        {data?.pages?.[0]?.total ?? ""}
                        {data?.pages?.[0]?.total ? " episodes" : ""}
                    </span>
                </div>
            </div>

            {isLoading ? (
                <div className="episodes-list">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            className="episode-skeleton"
                            key={index}
                        />
                    ))}
                </div>
            ) : isError ? (
                <p className="episodes-muted">
                    Episodes could not be loaded right now.
                </p>
            ) : (
                <>
                    <div className="episodes-list">
                        {episodes.map((episode, index) => {
                            const number = index + 1;
                            const watched = number <= watchedProgress;
                            const airedDate = episode.aired
                                ? new Date(episode.aired).toLocaleDateString()
                                : null;

                            return (
                                <article
                                    className={`episode-row ${watched ? "watched" : ""}`}
                                    key={episode.id ?? `${animeId}-${number}`}
                                >
                                    <div className="episode-number">
                                        {number}
                                    </div>

                                    <div className="episode-main">
                                        <h3>
                                            {episode.title || `Episode ${number}`}
                                        </h3>

                                        <div className="episode-meta">
                                            {airedDate && <span>{airedDate}</span>}

                                            {episode.duration && (
                                                <span>{episode.duration} min</span>
                                            )}

                                            {episode.filler && (
                                                <span className="episode-tag">Filler</span>
                                            )}

                                            {episode.recap && (
                                                <span className="episode-tag">Recap</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="episode-status">
                                        {watched && <span aria-label="Watched">✓</span>}

                                        {episode.score != null && Number(episode.score) > 0 && (
                                            <span className="episode-score">
                                                ⭐ {Number(episode.score).toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {hasNextPage && (
                        <div className="episodes-more">
                            <button
                                type="button"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage
                                    ? "Loading..."
                                    : "Load more episodes"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}


export default EpisodesSection;
