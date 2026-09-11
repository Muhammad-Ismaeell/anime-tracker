
import { useCallback, useEffect, useRef, useState } from "react";
import { Gamepad2, MousePointer2, Zap } from "lucide-react";

import "./cold-start-overlay.css";

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 300;

const PLAYER_X = 130;
const PLAYER_WIDTH = 42;
const PLAYER_HEIGHT = 54;
const GROUND_Y = 246;

const INITIAL_SPEED = 5;
const MAX_SPEED = 10;
const GRAVITY = 0.75;
const JUMP_FORCE = -14;

const OBSTACLE_WIDTH = 34;
const OBSTACLE_HEIGHT = 42;

const STAR_SIZE = 22;

const HOME_REFRESH_KEY =
    "anime-tracker:cold-start-home-refresh";

const randomId = () =>
    `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

const createObstacle = (x = GAME_WIDTH + 80) => ({
    id: randomId(),
    x,
    width: OBSTACLE_WIDTH,
    height: OBSTACLE_HEIGHT,
});

const createStar = (x = GAME_WIDTH + 160) => ({
    id: randomId(),
    x,
    y: 135 + Math.random() * 65,
});

const getInitialGame = () => ({
    player: {
        x: PLAYER_X,
        y: GROUND_Y - PLAYER_HEIGHT,
        velocityY: 0,
        grounded: true,
    },
    obstacles: [
        createObstacle(GAME_WIDTH + 80),
    ],
    stars: [
        createStar(GAME_WIDTH + 330),
    ],
    score: 0,
    speed: INITIAL_SPEED,
    elapsed: 0,
    gameOver: false,
    nextObstacleSpawn: 1150,
    nextStarSpawn: 850,
});

const rectanglesOverlap = (a, b) =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

const hasPendingHomeRefresh = () => {
    try {
        return (
            sessionStorage.getItem(
                HOME_REFRESH_KEY
            ) === "true"
        );
    } catch {
        return false;
    }
};

const markHomeRefreshComplete = () => {
    try {
        sessionStorage.removeItem(
            HOME_REFRESH_KEY
        );
    } catch {
        // Ignore storage errors.
    }
};

const markHomeRefreshPending = () => {
    try {
        sessionStorage.setItem(
            HOME_REFRESH_KEY,
            "true"
        );
    } catch {
        // Ignore storage errors.
    }
};

export default function ColdStartOverlay() {
    const [visible, setVisible] = useState(false);
    const [game, setGame] = useState(getInitialGame);
    const [elapsed, setElapsed] = useState(0);
    const [slowRequestCount, setSlowRequestCount] =
        useState(0);

    /*
     * Refs are used only for internal mutable values.
     * They are never read directly during render.
     */
    const slowRequests = useRef(0);
    const coldStartShown = useRef(false);
    const startedAt = useRef(null);

    const animationFrameRef = useRef(null);
    const timerRef = useRef(null);

    const gameRef = useRef(game);
    const jumpRequestedRef = useRef(false);

    const resetGame = useCallback(() => {
        const initialGame = getInitialGame();

        gameRef.current = initialGame;
        setGame(initialGame);
        setElapsed(0);

        startedAt.current = Date.now();
        jumpRequestedRef.current = false;
    }, []);

    const requestJump = useCallback(() => {
        jumpRequestedRef.current = true;
    }, []);

    /*
     * Called only after the final slow request finishes.
     *
     * If the overlay was never shown, this does absolutely
     * nothing. This means a normal/fast server response
     * never causes a refresh.
     */
    const finishColdStart = useCallback(() => {
        const wasColdStartShown =
            coldStartShown.current;

        slowRequests.current = 0;
        setSlowRequestCount(0);

        if (!wasColdStartShown) {
            return;
        }

        coldStartShown.current = false;
        setVisible(false);

        const isHome =
            window.location.pathname === "/" ||
            window.location.pathname === "";

        /*
         * Only refresh Home.
         */
        if (!isHome) {
            return;
        }

        /*
         * If this page was already reloaded because of
         * the cold-start experience, don't reload again.
         */
        if (hasPendingHomeRefresh()) {
            markHomeRefreshComplete();
            return;
        }

        /*
         * Mark the reload before performing it.
         */
        markHomeRefreshPending();

        /*
         * Let React process the overlay state update first.
         */
        window.requestAnimationFrame(() => {
            window.location.reload();
        });
    }, []);

    /*
     * Listen for events emitted by client.js.
     */
    useEffect(() => {
        const handleColdStart = (event) => {
            const { type, count } =
                event.detail || {};

            if (type === "start") {
                const previousCount =
                    slowRequests.current;

                /*
                 * Maintain our own request count.
                 */
                const nextCount = Math.max(
                    Number(count) || 0,
                    previousCount + 1
                );

                slowRequests.current =
                    nextCount;

                setSlowRequestCount(nextCount);

                /*
                 * Only the first slow request starts
                 * the cold-start experience.
                 *
                 * Additional simultaneous slow requests
                 * do not reset the runner.
                 */
                if (previousCount === 0) {
                    coldStartShown.current = true;

                    resetGame();
                    setVisible(true);
                }

                return;
            }

            if (type === "end") {
                const previousCount =
                    slowRequests.current;

                const nextCount = Math.max(
                    0,
                    Number(count) ||
                        previousCount - 1
                );

                slowRequests.current =
                    nextCount;

                setSlowRequestCount(nextCount);

                /*
                 * Only finish when every slow request
                 * has completed.
                 */
                if (
                    previousCount > 0 &&
                    nextCount === 0
                ) {
                    finishColdStart();
                }
            }
        };

        window.addEventListener(
            "anime-tracker:cold-start",
            handleColdStart
        );

        return () => {
            window.removeEventListener(
                "anime-tracker:cold-start",
                handleColdStart
            );
        };
    }, [
        finishColdStart,
        resetGame,
    ]);

    /*
     * Cleanup animation and timer loops.
     */
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(
                    animationFrameRef.current
                );

                animationFrameRef.current = null;
            }

            if (timerRef.current) {
                window.clearInterval(
                    timerRef.current
                );

                timerRef.current = null;
            }
        };
    }, []);

    /*
     * Keyboard controls.
     */
    useEffect(() => {
        if (!visible) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (
                event.code === "Space" ||
                event.code === "ArrowUp" ||
                event.code === "KeyW"
            ) {
                event.preventDefault();
                requestJump();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [visible, requestJump]);

    /*
     * Elapsed time.
     */
    useEffect(() => {
        if (!visible) {
            if (timerRef.current) {
                window.clearInterval(
                    timerRef.current
                );

                timerRef.current = null;
            }

            return undefined;
        }

        if (!startedAt.current) {
            startedAt.current = Date.now();
        }

        timerRef.current =
            window.setInterval(() => {
                if (startedAt.current) {
                    setElapsed(
                        Date.now() -
                            startedAt.current
                    );
                }
            }, 250);

        return () => {
            if (timerRef.current) {
                window.clearInterval(
                    timerRef.current
                );

                timerRef.current = null;
            }
        };
    }, [visible]);

    /*
     * Main runner game loop.
     */
    useEffect(() => {
        if (!visible) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(
                    animationFrameRef.current
                );

                animationFrameRef.current = null;
            }

            return undefined;
        }

        let lastTime = performance.now();

        const tick = (now) => {
            const delta = Math.min(
                32,
                Math.max(
                    8,
                    now - lastTime
                )
            );

            lastTime = now;

            const frameScale =
                delta / 16.67;

            setGame((previous) => {
                if (previous.gameOver) {
                    gameRef.current =
                        previous;

                    return previous;
                }

                const player = {
                    ...previous.player,
                };

                let obstacles =
                    previous.obstacles.map(
                        (obstacle) => ({
                            ...obstacle,
                        })
                    );

                let stars =
                    previous.stars.map(
                        (star) => ({
                            ...star,
                        })
                    );

                const speed = Math.min(
                    MAX_SPEED,
                    previous.speed +
                        0.0025 *
                            frameScale
                );

                /*
                 * Jump.
                 */
                if (
                    jumpRequestedRef.current &&
                    player.grounded
                ) {
                    player.velocityY =
                        JUMP_FORCE;

                    player.grounded = false;
                }

                jumpRequestedRef.current =
                    false;

                /*
                 * Gravity.
                 */
                player.velocityY +=
                    GRAVITY *
                    frameScale;

                player.y +=
                    player.velocityY *
                    frameScale;

                const floorY =
                    GROUND_Y -
                    PLAYER_HEIGHT;

                if (player.y >= floorY) {
                    player.y = floorY;
                    player.velocityY = 0;
                    player.grounded = true;
                }

                /*
                 * Move obstacles.
                 */
                obstacles = obstacles
                    .map((obstacle) => ({
                        ...obstacle,
                        x:
                            obstacle.x -
                            speed *
                                frameScale,
                    }))
                    .filter(
                        (obstacle) =>
                            obstacle.x >
                            -obstacle.width -
                                50
                    );

                /*
                 * Move stars.
                 */
                stars = stars
                    .map((star) => ({
                        ...star,
                        x:
                            star.x -
                            speed *
                                0.9 *
                                frameScale,
                    }))
                    .filter(
                        (star) =>
                            star.x >
                            -STAR_SIZE - 50
                    );

                /*
                 * Spawn obstacles.
                 */
                let nextObstacleSpawn =
                    previous.nextObstacleSpawn -
                    speed *
                        frameScale;

                if (
                    nextObstacleSpawn <= 0
                ) {
                    obstacles.push(
                        createObstacle(
                            GAME_WIDTH + 40
                        )
                    );

                    nextObstacleSpawn =
                        900 +
                        Math.random() *
                            700;
                }

                /*
                 * Spawn stars.
                 */
                let nextStarSpawn =
                    previous.nextStarSpawn -
                    speed *
                        frameScale;

                if (
                    nextStarSpawn <= 0
                ) {
                    stars.push(
                        createStar(
                            GAME_WIDTH + 80
                        )
                    );

                    nextStarSpawn =
                        700 +
                        Math.random() *
                            900;
                }

                /*
                 * Player collision box.
                 */
                const playerBox = {
                    x: player.x + 7,
                    y: player.y + 5,
                    width:
                        PLAYER_WIDTH - 14,
                    height:
                        PLAYER_HEIGHT - 7,
                };

                /*
                 * Obstacle collision.
                 */
                const hitObstacle =
                    obstacles.some(
                        (obstacle) =>
                            rectanglesOverlap(
                                playerBox,
                                {
                                    x:
                                        obstacle.x +
                                        3,
                                    y:
                                        GROUND_Y -
                                        obstacle.height,
                                    width:
                                        obstacle.width -
                                        6,
                                    height:
                                        obstacle.height,
                                }
                            )
                    );

                if (hitObstacle) {
                    const nextGame = {
                        ...previous,
                        player,
                        obstacles,
                        stars,
                        speed,
                        gameOver: true,
                        nextObstacleSpawn,
                        nextStarSpawn,
                    };

                    gameRef.current =
                        nextGame;

                    return nextGame;
                }

                /*
                 * Collect stars.
                 */
                const remainingStars = [];
                let collectedStars = 0;

                for (const star of stars) {
                    const starBox = {
                        x: star.x,
                        y: star.y,
                        width: STAR_SIZE,
                        height: STAR_SIZE,
                    };

                    if (
                        rectanglesOverlap(
                            playerBox,
                            starBox
                        )
                    ) {
                        collectedStars +=
                            1;
                    } else {
                        remainingStars.push(
                            star
                        );
                    }
                }

                /*
                 * Survival score:
                 * approximately +1 every second.
                 */
                const nextElapsed =
                    previous.elapsed +
                    delta;

                const score =
                    Math.floor(
                        nextElapsed /
                            1000
                    ) +
                    collectedStars;

                const nextGame = {
                    player,
                    obstacles,
                    stars: remainingStars,
                    score,
                    speed,
                    elapsed:
                        nextElapsed,
                    gameOver: false,
                    nextObstacleSpawn,
                    nextStarSpawn,
                };

                gameRef.current =
                    nextGame;

                return nextGame;
            });

            animationFrameRef.current =
                requestAnimationFrame(
                    tick
                );
        };

        animationFrameRef.current =
            requestAnimationFrame(tick);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(
                    animationFrameRef.current
                );

                animationFrameRef.current = null;
            }
        };
    }, [visible]);

    const handleRestart = () => {
        resetGame();
    };

    /*
     * When the server is already awake,
     * render absolutely nothing.
     */
    if (!visible) {
        return null;
    }

    const displaySeconds = Math.floor(
        elapsed / 1000
    );

    return (
        <div
            className="cold-start"
            role="dialog"
            aria-modal="true"
            aria-label="Server wake-up"
        >
            <div className="cold-start__backdrop" />

            <section className="cold-start__panel">
                <div className="cold-start__header">
                    <div className="cold-start__title-group">
                        <div className="cold-start__icon">
                            <Zap size={22} />
                        </div>

                        <div>
                            <p className="cold-start__eyebrow">
                                ANIME TRACKER
                            </p>

                            <h2>
                                Server Wake-Up Run
                            </h2>
                        </div>
                    </div>

                    <div className="cold-start__status">
                        <span className="cold-start__status-dot" />
                        Waking up
                    </div>
                </div>

                <div className="cold-start__message">
                    <strong>
                        The server is waking up...
                    </strong>

                    <span>
                        Waiting for the API
                        response. This screen
                        disappears automatically
                        when the server is ready.
                    </span>
                </div>

                <div className="cold-start__stats">
                    <div className="cold-start__stat">
                        <span>TIME</span>

                        <strong>
                            {displaySeconds}s
                        </strong>
                    </div>

                    <div className="cold-start__stat">
                        <span>SCORE</span>

                        <strong>
                            {game.score}
                        </strong>
                    </div>

                    <div className="cold-start__stat">
                        <span>REQUESTS</span>

                        <strong>
                            {slowRequestCount}
                        </strong>
                    </div>
                </div>

                <div
                    className="cold-start__game"
                    style={{
                        "--game-width": `${GAME_WIDTH}px`,
                        "--game-height": `${GAME_HEIGHT}px`,
                    }}
                    onClick={requestJump}
                    onPointerDown={requestJump}
                >
                    <div className="cold-start__skyline">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className="cold-start__moon" />

                    {game.stars.map(
                        (star) => (
                            <div
                                key={star.id}
                                className="cold-start__star"
                                style={{
                                    transform:
                                        `translate(${star.x}px, ${star.y}px)`,
                                }}
                            >
                                ✦
                            </div>
                        )
                    )}

                    {game.obstacles.map(
                        (obstacle) => (
                            <div
                                key={obstacle.id}
                                className="cold-start__obstacle"
                                style={{
                                    transform:
                                        `translate(${obstacle.x}px, ${
                                            GROUND_Y -
                                            obstacle.height
                                        }px)`,
                                    width:
                                        obstacle.width,
                                    height:
                                        obstacle.height,
                                }}
                            >
                                <span />
                                <span />
                            </div>
                        )
                    )}

                    <div
                        className={`cold-start__player ${
                            game.player.grounded
                                ? ""
                                : "is-jumping"
                        }`}
                        style={{
                            transform:
                                `translate(${game.player.x}px, ${game.player.y}px)`,
                        }}
                    >
                        <div className="cold-start__player-head">
                            <span className="cold-start__player-eye" />
                            <span className="cold-start__player-eye" />
                        </div>

                        <div className="cold-start__player-body" />

                        <div className="cold-start__player-arm cold-start__player-arm--left" />

                        <div className="cold-start__player-arm cold-start__player-arm--right" />

                        <div className="cold-start__player-leg cold-start__player-leg--left" />

                        <div className="cold-start__player-leg cold-start__player-leg--right" />
                    </div>

                    <div className="cold-start__ground" />

                    {game.gameOver && (
                        <div className="cold-start__game-over">
                            <div className="cold-start__game-over-card">
                                <strong>
                                    GAME OVER
                                </strong>

                                <span>
                                    The server is
                                    still waking
                                    up.
                                </span>

                                <button
                                    type="button"
                                    onClick={(
                                        event
                                    ) => {
                                        event.stopPropagation();
                                        handleRestart();
                                    }}
                                >
                                    RESTART
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="cold-start__controls">
                    <div>
                        <Gamepad2 size={18} />

                        <span>
                            <kbd>SPACE</kbd>
                            <kbd>↑</kbd>
                            <kbd>W</kbd>
                            to jump
                        </span>
                    </div>

                    <div>
                        <MousePointer2 size={18} />

                        <span>
                            Click or tap the
                            runner
                        </span>
                    </div>

                    <button
                        type="button"
                        className="cold-start__jump-button"
                        onClick={requestJump}
                    >
                        JUMP
                    </button>
                </div>

                <p className="cold-start__footer">
                    Free hosting can take a
                    little longer to wake up
                    after inactivity.
                </p>
            </section>
        </div>
    );
}
