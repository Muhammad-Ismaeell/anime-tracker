import { useCallback, useEffect, useRef, useState } from "react";
import { Gamepad2, MousePointer2, Zap } from "lucide-react";

import "./cold-start-overlay.css";

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 300;

const PLAYER_X = 130;
const PLAYER_WIDTH = 42;
const PLAYER_HEIGHT = 63;

const GROUND_Y = 246;

const INITIAL_SPEED = 5;
const MAX_SPEED = 14;
const SPEED_ACCELERATION = 0.008;

const GRAVITY = 0.75;
const JUMP_FORCE = -14;

const OBSTACLE_WIDTH = 34;
const OBSTACLE_HEIGHT = 42;

const STAR_SIZE = 22;
const STAR_COLLISION_PADDING = 6;
const STAR_SCORE = 10;

const HOME_REFRESH_KEY = "anime-tracker:cold-start-home-refresh";

/* -------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------- */

const randomId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

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

    obstacles: [createObstacle()],

    stars: [createStar(GAME_WIDTH + 330)],

    score: 0,
    starsCollected: 0,

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

/* -------------------------------------------------- */
/* Home refresh protection */
/* -------------------------------------------------- */

const hasPendingHomeRefresh = () => {
    try {
        return (
            sessionStorage.getItem(HOME_REFRESH_KEY) === "true"
        );
    } catch {
        return false;
    }
};

const markHomeRefreshComplete = () => {
    try {
        sessionStorage.removeItem(HOME_REFRESH_KEY);
    } catch {
        // Ignore storage errors.
    }
};

const markHomeRefreshPending = () => {
    try {
        sessionStorage.setItem(HOME_REFRESH_KEY, "true");
    } catch {
        // Ignore storage errors.
    }
};

/* -------------------------------------------------- */
/* Component */
/* -------------------------------------------------- */

export default function ColdStartOverlay() {
    const [visible, setVisible] = useState(false);
    const [game, setGame] = useState(getInitialGame);
    const [elapsed, setElapsed] = useState(0);
    const [gameScale, setGameScale] = useState(1);

    /*
     * Tracks how many requests are currently considered
     * slow/cold-start requests.
     *
     * This stays in a ref because it is internal request
     * bookkeeping and does not need to trigger rendering.
     */
    const slowRequests = useRef(0);

    /*
     * Used to distinguish:
     *
     * Fast request:
     *   no overlay -> no reload
     *
     * Slow request:
     *   overlay shown -> reload Home after completion
     */
    const coldStartShown = useRef(false);

    const startedAt = useRef(null);

    const animationFrameRef = useRef(null);
    const timerRef = useRef(null);

    const gameRef = useRef(game);

    const gameViewportRef = useRef(null);

    const jumpRequestedRef = useRef(false);

    /* -------------------------------------------------- */
    /* Game reset */
    /* -------------------------------------------------- */

    const resetGame = useCallback(() => {
        const initialGame = getInitialGame();

        gameRef.current = initialGame;

        setGame(initialGame);
        setElapsed(0);

        startedAt.current = Date.now();

        jumpRequestedRef.current = false;
    }, []);

    /* -------------------------------------------------- */
    /* Jump */
    /* -------------------------------------------------- */

    const requestJump = useCallback(() => {
        jumpRequestedRef.current = true;
    }, []);

    /* -------------------------------------------------- */
    /* Cold-start completion */
    /* -------------------------------------------------- */

    const finishColdStart = useCallback(() => {
        const wasColdStartShown =
            coldStartShown.current;

        slowRequests.current = 0;

        /*
         * If the request was fast enough that the overlay
         * never appeared, do absolutely nothing.
         */
        if (!wasColdStartShown) {
            return;
        }

        coldStartShown.current = false;

        setVisible(false);

        /*
         * Only refresh Home.
         *
         * If the user is on Search, Detail, Library, etc.,
         * simply remove the overlay.
         */
        const isHome =
            window.location.pathname === "/" ||
            window.location.pathname === "";

        if (!isHome) {
            return;
        }

        /*
         * Prevent a refresh loop.
         */
        if (hasPendingHomeRefresh()) {
            markHomeRefreshComplete();
            return;
        }

        markHomeRefreshPending();

        /*
         * Let React remove the overlay before refreshing.
         */
        window.requestAnimationFrame(() => {
            window.location.reload();
        });
    }, []);

    /* -------------------------------------------------- */
    /* Cold-start event listener */
    /* -------------------------------------------------- */

    useEffect(() => {
        const handleColdStart = (event) => {
            const { type, count } =
                event.detail || {};

            /* ------------------------------------------ */
            /* Slow request started */
            /* ------------------------------------------ */

            if (type === "start") {
                const previousCount =
                    slowRequests.current;

                const nextCount =
                    typeof count === "number"
                        ? Math.max(
                              previousCount + 1,
                              count
                          )
                        : previousCount + 1;

                slowRequests.current = nextCount;

                /*
                 * Only the FIRST slow request opens the
                 * overlay.
                 */
                if (previousCount === 0) {
                    coldStartShown.current = true;

                    resetGame();

                    setVisible(true);
                }

                return;
            }

            /* ------------------------------------------ */
            /* Slow request finished */
            /* ------------------------------------------ */

            if (type === "end") {
                const previousCount =
                    slowRequests.current;

                const nextCount =
                    typeof count === "number"
                        ? Math.max(0, count)
                        : Math.max(
                              0,
                              previousCount - 1
                          );

                slowRequests.current = nextCount;

                /*
                 * Only finish when ALL slow requests
                 * have completed.
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
    }, [finishColdStart, resetGame]);

    /* -------------------------------------------------- */
    /* Clear stale refresh flag after page reload */
    /* -------------------------------------------------- */

    useEffect(() => {
        /*
         * If we arrived here because the previous page
         * performed the Home refresh, clear the marker.
         *
         * This prevents the next genuine cold start from
         * being incorrectly treated as the refresh itself.
         */
        markHomeRefreshComplete();
    }, []);

    /* -------------------------------------------------- */
    /* General cleanup */
    /* -------------------------------------------------- */

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(
                    animationFrameRef.current
                );
            }

            if (timerRef.current) {
                window.clearInterval(
                    timerRef.current
                );
            }
        };
    }, []);

    /* -------------------------------------------------- */
    /* Responsive game scaling */
    /* -------------------------------------------------- */

    useEffect(() => {
        if (!visible || !gameViewportRef.current) {
            return undefined;
        }

        const viewport =
            gameViewportRef.current;

        const updateGameScale = () => {
            const width = viewport.clientWidth;

            if (!width) {
                return;
            }

            /*
             * Physics always remain 1000x300.
             *
             * Only the visual representation scales.
             */
            const scale = Math.min(
                1,
                width / GAME_WIDTH
            );

            setGameScale(scale);
        };

        updateGameScale();

        const resizeObserver =
            new ResizeObserver(
                updateGameScale
            );

        resizeObserver.observe(viewport);

        return () => {
            resizeObserver.disconnect();
        };
    }, [visible]);

    /* -------------------------------------------------- */
    /* Keyboard controls */
    /* -------------------------------------------------- */

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

    /* -------------------------------------------------- */
    /* Timer */
    /* -------------------------------------------------- */

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

        timerRef.current = window.setInterval(
            () => {
                if (startedAt.current) {
                    setElapsed(
                        Date.now() -
                            startedAt.current
                    );
                }
            },
            250
        );

        return () => {
            if (timerRef.current) {
                window.clearInterval(
                    timerRef.current
                );

                timerRef.current = null;
            }
        };
    }, [visible]);

    /* -------------------------------------------------- */
    /* Game loop */
    /* -------------------------------------------------- */

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
                    gameRef.current = previous;

                    return previous;
                }

                /* -------------------------------------- */
                /* Copy game state */
                /* -------------------------------------- */

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

                /* -------------------------------------- */
                /* Increase speed */
                /* -------------------------------------- */

                const speed = Math.min(
                    MAX_SPEED,
                    previous.speed +
                        SPEED_ACCELERATION *
                            frameScale
                );

                /* -------------------------------------- */
                /* Jump */
                /* -------------------------------------- */

                if (
                    jumpRequestedRef.current &&
                    player.grounded
                ) {
                    player.velocityY =
                        JUMP_FORCE;

                    player.grounded = false;
                }

                jumpRequestedRef.current = false;

                /* -------------------------------------- */
                /* Gravity */
                /* -------------------------------------- */

                player.velocityY +=
                    GRAVITY *
                    frameScale;

                player.y +=
                    player.velocityY *
                    frameScale;

                /* -------------------------------------- */
                /* Ground collision */
                /* -------------------------------------- */

                const floorY =
                    GROUND_Y -
                    PLAYER_HEIGHT;

                if (player.y >= floorY) {
                    player.y = floorY;

                    player.velocityY = 0;

                    player.grounded = true;
                }

                /* -------------------------------------- */
                /* Move obstacles */
                /* -------------------------------------- */

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

                /* -------------------------------------- */
                /* Move stars */
                /* -------------------------------------- */

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
                            -STAR_SIZE -
                                50
                    );

                /* -------------------------------------- */
                /* Spawn obstacle */
                /* -------------------------------------- */

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

                /* -------------------------------------- */
                /* Spawn star */
                /* -------------------------------------- */

                let nextStarSpawn =
                    previous.nextStarSpawn -
                    speed *
                        frameScale;

                if (nextStarSpawn <= 0) {
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

                /* -------------------------------------- */
                /* Player collision box */
                /* -------------------------------------- */

                const playerBox = {
                    x:
                        player.x + 4,

                    y:
                        player.y + 3,

                    width:
                        PLAYER_WIDTH - 8,

                    height:
                        PLAYER_HEIGHT - 6,
                };

                /* -------------------------------------- */
                /* Obstacle collision */
                /* -------------------------------------- */

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

                /* -------------------------------------- */
                /* Star collection */
                /* -------------------------------------- */

                const remainingStars = [];

                let collectedStars = 0;

                for (const star of stars) {
                    const starBox = {
                        x:
                            star.x -
                            STAR_COLLISION_PADDING,

                        y:
                            star.y -
                            STAR_COLLISION_PADDING,

                        width:
                            STAR_SIZE +
                            STAR_COLLISION_PADDING *
                                2,

                        height:
                            STAR_SIZE +
                            STAR_COLLISION_PADDING *
                                2,
                    };

                    if (
                        rectanglesOverlap(
                            playerBox,
                            starBox
                        )
                    ) {
                        collectedStars += 1;
                    } else {
                        remainingStars.push(
                            star
                        );
                    }
                }

                /* -------------------------------------- */
                /* Score */
                /* -------------------------------------- */

                const nextElapsed =
                    previous.elapsed +
                    delta;

                const starsCollected =
                    previous.starsCollected +
                    collectedStars;

                const score =
                    Math.floor(
                        nextElapsed / 1000
                    ) +
                    starsCollected *
                        STAR_SCORE;

                /* -------------------------------------- */
                /* New game state */
                /* -------------------------------------- */

                const nextGame = {
                    player,

                    obstacles,

                    stars:
                        remainingStars,

                    score,

                    starsCollected,

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
                requestAnimationFrame(tick);
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

    /* -------------------------------------------------- */
    /* Restart */
    /* -------------------------------------------------- */

    const handleRestart = () => {
        resetGame();
    };

    /* -------------------------------------------------- */
    /* Hidden until cold start */
    /* -------------------------------------------------- */

    if (!visible) {
        return null;
    }

    const displaySeconds =
        Math.floor(elapsed / 1000);

    /* -------------------------------------------------- */
    /* Render */
    /* -------------------------------------------------- */

    return (
        <div
            className="cold-start"
            role="dialog"
            aria-modal="true"
            aria-label="Server wake-up"
        >
            <div className="cold-start__backdrop" />

            <section className="cold-start__panel">

                {/* -------------------------------------- */}
                {/* Header */}
                {/* -------------------------------------- */}

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

                {/* -------------------------------------- */}
                {/* Message */}
                {/* -------------------------------------- */}

                <div className="cold-start__message">
                    <strong>
                        The server is waking up...
                    </strong>

                    <span>
                        Waiting for the API response.
                        This screen disappears
                        automatically when the server
                        is ready.
                    </span>
                </div>

                {/* -------------------------------------- */}
                {/* Stats */}
                {/* -------------------------------------- */}

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
                        <span>STARS</span>
                        <strong>
                            {game.starsCollected}
                        </strong>
                    </div>
                </div>

                {/* -------------------------------------- */}
                {/* Responsive game viewport */}
                {/* -------------------------------------- */}

                <div
                    ref={gameViewportRef}
                    className="cold-start__game"
                    style={{
                        "--game-scale":
                            gameScale,
                    }}
                    onPointerDown={(event) => {
                        /*
                         * Prevent browser gestures and
                         * avoid duplicate click handling.
                         */
                        event.preventDefault();

                        requestJump();
                    }}
                >
                    {/* ---------------------------------- */}
                    {/* Fixed 1000x300 game world */}
                    {/* ---------------------------------- */}

                    <div className="cold-start__game-world">

                        {/* ------------------------------ */}
                        {/* Skyline */}
                        {/* ------------------------------ */}

                        <div className="cold-start__skyline">
                            <span />
                            <span />
                            <span />
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>

                        {/* ------------------------------ */}
                        {/* Moon */}
                        {/* ------------------------------ */}

                        <div className="cold-start__moon">
                            ◐
                        </div>

                        {/* ------------------------------ */}
                        {/* Stars */}
                        {/* ------------------------------ */}

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

                        {/* ------------------------------ */}
                        {/* Obstacles */}
                        {/* ------------------------------ */}

                        {game.obstacles.map(
                            (obstacle) => (
                                <div
                                    key={
                                        obstacle.id
                                    }
                                    className="cold-start__obstacle"
                                    style={{
                                        transform:
                                            `translate(${obstacle.x}px, ${GROUND_Y - obstacle.height}px)`,

                                        width:
                                            obstacle.width,

                                        height:
                                            obstacle.height,
                                    }}
                                >
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            )
                        )}

                        {/* ------------------------------ */}
                        {/* Runner */}
                        {/* ------------------------------ */}

                        <div
                            className={[
                                "cold-start__runner",

                                game.player
                                    .grounded
                                    ? ""
                                    : "cold-start__runner--jumping",

                                game.gameOver
                                    ? "cold-start__runner--dead"
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            style={{
                                transform:
                                    `translate(${game.player.x}px, ${game.player.y}px)`,
                            }}
                        >
                            <div className="cold-start__runner-head">
                                <span className="cold-start__eye cold-start__eye--left" />

                                <span className="cold-start__eye cold-start__eye--right" />
                            </div>

                            <div className="cold-start__runner-body" />

                            <div className="cold-start__arm cold-start__arm--left" />

                            <div className="cold-start__arm cold-start__arm--right" />

                            <div className="cold-start__runner-leg cold-start__runner-leg--left" />

                            <div className="cold-start__runner-leg cold-start__runner-leg--right" />
                        </div>

                        {/* ------------------------------ */}
                        {/* Ground */}
                        {/* ------------------------------ */}

                        <div
                            className="cold-start__ground"
                            style={{
                                height:
                                    GAME_HEIGHT -
                                    GROUND_Y,
                            }}
                        />

                        {/* ------------------------------ */}
                        {/* Game over */}
                        {/* ------------------------------ */}

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
                                        onPointerDown={(
                                            event
                                        ) => {
                                            event.stopPropagation();
                                            event.preventDefault();

                                            handleRestart();
                                        }}
                                    >
                                        RESTART
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* -------------------------------------- */}
                {/* Controls */}
                {/* -------------------------------------- */}

                <div className="cold-start__controls">

                    <div>
                        <Gamepad2 size={18} />

                        <span>
                            <kbd>SPACE</kbd>
                            <kbd>↑</kbd>
                            <kbd>W</kbd>
                            {" "}to jump
                        </span>
                    </div>

                    <div>
                        <MousePointer2 size={18} />

                        <span>
                            Tap the game or use JUMP
                        </span>
                    </div>

                    <button
                        type="button"
                        className="cold-start__jump-button"
                        onPointerDown={(
                            event
                        ) => {
                            event.stopPropagation();
                            event.preventDefault();

                            requestJump();
                        }}
                    >
                        JUMP
                    </button>
                </div>

                {/* -------------------------------------- */}
                {/* Footer */}
                {/* -------------------------------------- */}

                <p className="cold-start__footer">
                    Free hosting can take a little longer
                    to wake up after inactivity.
                </p>
            </section>
        </div>
    );
}