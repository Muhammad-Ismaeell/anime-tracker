import { useCallback, useEffect, useRef, useState } from "react";
import {
    Gamepad2,
    Heart,
    RotateCcw,
    Star,
    Trophy,
    Zap,
} from "lucide-react";
import "./cold-start-overlay.css";

const GAME_WIDTH = 1000;

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

function randomId() {
    return (
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random()}`
    );
}

function createObstacle(x = GAME_WIDTH + 100) {
    return {
        id: randomId(),
        x,
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT,
    };
}

function createStar(x = GAME_WIDTH + 250) {
    return {
        id: randomId(),
        x,
        y: 135 + Math.random() * 65,
    };
}

function rectanglesOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function getInitialGame() {
    return {
        playerY: GROUND_Y - PLAYER_HEIGHT,
        velocityY: 0,
        isJumping: false,
        obstacles: [createObstacle(GAME_WIDTH + 260)],
        stars: [createStar(GAME_WIDTH + 500)],
        score: 0,
        speed: INITIAL_SPEED,
        gameOver: false,
    };
}

export default function ColdStartOverlay() {
    const [visible, setVisible] = useState(false);
    const [game, setGame] = useState(getInitialGame);
    const [elapsed, setElapsed] = useState(0);

    const slowRequests = useRef(0);
    const startedAt = useRef(null);

    const animationFrameRef = useRef(null);
    const timerRef = useRef(null);

    const gameRef = useRef(game);
    const jumpRequestedRef = useRef(false);

    useEffect(() => {
        gameRef.current = game;
    }, [game]);

    const resetGame = useCallback(() => {
        const nextGame = getInitialGame();

        gameRef.current = nextGame;
        jumpRequestedRef.current = false;
        setGame(nextGame);
    }, []);

    /*
     * Listen for the Axios cold-start events.
     *
     * Important:
     * We only reset the game when the first slow request appears.
     * If several API requests are slow at the same time, the game
     * continues instead of restarting.
     */
    useEffect(() => {
        const handleColdStart = (event) => {
            const { type, count = 0 } = event.detail ?? {};

            if (type === "start") {
                const wasAlreadyVisible = slowRequests.current > 0;

                slowRequests.current = count;

                startedAt.current ??= performance.now();

                setVisible(true);

                if (!wasAlreadyVisible) {
                    resetGame();
                }

                return;
            }

            if (type === "end") {
                slowRequests.current = Math.max(0, slowRequests.current - 1);

                if (slowRequests.current === 0) {
                    setVisible(false);

                    if (window.location.pathname === "/") {
                        window.location.reload();
                    }
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
    }, [resetGame]);

    /*
     * Elapsed time.
     */
    useEffect(() => {
        if (!visible) return undefined;

        timerRef.current = window.setInterval(() => {
            if (!startedAt.current) return;

            setElapsed(
                Math.floor(
                    (performance.now() - startedAt.current) / 1000
                )
            );
        }, 250);

        return () => {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
            }
        };
    }, [visible]);

    /*
     * Request a jump.
     */
    const jump = useCallback(() => {
        if (!visible) return;

        const current = gameRef.current;

        if (current.gameOver) {
            resetGame();
            return;
        }

        if (!current.isJumping) {
            jumpRequestedRef.current = true;
        }
    }, [resetGame, visible]);

    /*
     * Keyboard controls.
     */
    useEffect(() => {
        if (!visible) return undefined;

        const handleKeyDown = (event) => {
            if (
                event.code === "Space" ||
                event.code === "ArrowUp" ||
                event.code === "KeyW"
            ) {
                event.preventDefault();

                if (!event.repeat) {
                    jump();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [jump, visible]);

    /*
     * Main runner game loop.
     */
    useEffect(() => {
        if (!visible) return undefined;

        let previousTime = performance.now();

        const loop = (currentTime) => {
            const delta = Math.min(
                (currentTime - previousTime) / 16.67,
                2
            );

            previousTime = currentTime;

            setGame((previous) => {
                if (previous.gameOver) {
                    return previous;
                }

                let playerY = previous.playerY;
                let velocityY = previous.velocityY;
                let isJumping = previous.isJumping;

                if (jumpRequestedRef.current && !isJumping) {
                    velocityY = JUMP_FORCE;
                    isJumping = true;
                }

                jumpRequestedRef.current = false;

                velocityY += GRAVITY * delta;
                playerY += velocityY * delta;

                const floorY = GROUND_Y - PLAYER_HEIGHT;

                if (playerY >= floorY) {
                    playerY = floorY;
                    velocityY = 0;
                    isJumping = false;
                }

                const speed = Math.min(
                    previous.speed + 0.0025 * delta,
                    MAX_SPEED
                );

                let obstacles = previous.obstacles
                    .map((obstacle) => ({
                        ...obstacle,
                        x: obstacle.x - speed * delta,
                    }))
                    .filter(
                        (obstacle) =>
                            obstacle.x + obstacle.width > -50
                    );

                let stars = previous.stars
                    .map((star) => ({
                        ...star,
                        x: star.x - speed * delta,
                    }))
                    .filter((star) => star.x > -50);

                /*
                 * Spawn obstacles.
                 */
                const lastObstacle =
                    obstacles[obstacles.length - 1];

                if (
                    !lastObstacle ||
                    lastObstacle.x < GAME_WIDTH - 330
                ) {
                    const spacing =
                        300 + Math.random() * 260;

                    obstacles.push(
                        createObstacle(
                            GAME_WIDTH + spacing
                        )
                    );
                }

                /*
                 * Spawn stars.
                 */
                const lastStar = stars[stars.length - 1];

                if (
                    !lastStar ||
                    lastStar.x < GAME_WIDTH - 280
                ) {
                    stars.push(
                        createStar(
                            GAME_WIDTH +
                                350 +
                                Math.random() * 250
                        )
                    );
                }

                const playerRect = {
                    x: PLAYER_X + 8,
                    y: playerY + 5,
                    width: PLAYER_WIDTH - 16,
                    height: PLAYER_HEIGHT - 8,
                };

                /*
                 * Obstacle collision.
                 */
                const hitObstacle = obstacles.some((obstacle) => {
                    const obstacleRect = {
                        x: obstacle.x,
                        y:
                            GROUND_Y -
                            obstacle.height,
                        width: obstacle.width,
                        height: obstacle.height,
                    };

                    return rectanglesOverlap(
                        playerRect,
                        obstacleRect
                    );
                });

                if (hitObstacle) {
                    const nextGame = {
                        ...previous,
                        playerY,
                        velocityY,
                        isJumping,
                        obstacles,
                        stars,
                        speed,
                        gameOver: true,
                    };

                    gameRef.current = nextGame;

                    return nextGame;
                }

                /*
                 * Collect stars.
                 */
                let scoreIncrease = 0;

                stars = stars.filter((star) => {
                    const starRect = {
                        x: star.x,
                        y: star.y,
                        width: STAR_SIZE,
                        height: STAR_SIZE,
                    };

                    const collected = rectanglesOverlap(
                        playerRect,
                        starRect
                    );

                    if (collected) {
                        scoreIncrease += 10;
                    }

                    return !collected;
                });

                const nextScore =
                    previous.score + scoreIncrease;

                /*
                 * Extra score for surviving.
                 */
                const nextGame = {
                    ...previous,
                    playerY,
                    velocityY,
                    isJumping,
                    obstacles,
                    stars,
                    speed,
                    score: nextScore,
                };

                gameRef.current = nextGame;

                return nextGame;
            });

            animationFrameRef.current =
                requestAnimationFrame(loop);
        };

        animationFrameRef.current =
            requestAnimationFrame(loop);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(
                    animationFrameRef.current
                );
                animationFrameRef.current = null;
            }
        };
    }, [visible]);

    /*
     * Add passive survival score every second.
     */
    useEffect(() => {
        if (!visible) return undefined;

        const scoreTimer = window.setInterval(() => {
            setGame((current) => {
                if (current.gameOver) {
                    return current;
                }

                const next = {
                    ...current,
                    score: current.score + 1,
                };

                gameRef.current = next;

                return next;
            });
        }, 1000);

        return () => {
            window.clearInterval(scoreTimer);
        };
    }, [visible]);

    if (!visible) {
        return null;
    }

    return (
        <div
            className="cold-start"
            role="dialog"
            aria-modal="true"
            aria-label="Anime Tracker backend waking up"
        >
            <div className="cold-start__backdrop" />

            <section className="cold-start__panel">
                <div
                    className="cold-start__energy cold-start__energy--one"
                    aria-hidden="true"
                />

                <div
                    className="cold-start__energy cold-start__energy--two"
                    aria-hidden="true"
                />

                <div
                    className="cold-start__icon"
                    aria-hidden="true"
                >
                    <Zap size={28} strokeWidth={2.5} />
                </div>

                <p className="cold-start__eyebrow">
                    ANIME TRACKER
                </p>

                <h2>
                    Waking up the server
                    <span className="cold-start__dots">
                        ...
                    </span>
                </h2>

                <p className="cold-start__message">
                    The backend is taking a quick nap 😴.
                    While it wakes up, help your character
                    survive the run.
                </p>

                <div className="cold-start__status">
                    <span className="cold-start__pulse" />

                    <span>
                        Waiting for the API response
                    </span>

                    <span className="cold-start__time">
                        {elapsed}s
                    </span>
                </div>

                <div
                    className="cold-start__game"
                    aria-label="Anime runner mini game"
                >
                    <div className="cold-start__game-header">
                        <span>
                            <Gamepad2 size={16} />
                            Server Wake-Up Run
                        </span>

                        <div className="cold-start__score">
                            <Trophy size={14} />
                            <strong>
                                {game.score}
                            </strong>
                        </div>
                    </div>

                    <p>
                        Jump over obstacles and collect
                        energy while the backend wakes up.
                    </p>

                    <div
                        className="cold-start__arena"
                        onPointerDown={(event) => {
                            /*
                             * Prevent clicking UI elements from
                             * triggering a jump accidentally.
                             */
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                jump();
                            }
                        }}
                    >
                        <div
                            className="cold-start__skyline"
                            aria-hidden="true"
                        >
                            <span>▰</span>
                            <span>▰▰</span>
                            <span>▰</span>
                            <span>▰▰▰</span>
                            <span>▰</span>
                        </div>

                        <div
                            className="cold-start__moon"
                            aria-hidden="true"
                        >
                            ☾
                        </div>

                        {game.stars.map((star) => (
                            <div
                                key={star.id}
                                className="cold-start__star"
                                style={{
                                    left: `${star.x}px`,
                                    top: `${star.y}px`,
                                }}
                                aria-hidden="true"
                            >
                                <Star
                                    size={STAR_SIZE}
                                    fill="currentColor"
                                />
                            </div>
                        ))}

                        {game.obstacles.map((obstacle) => (
                            <div
                                key={obstacle.id}
                                className="cold-start__obstacle"
                                style={{
                                    left: `${obstacle.x}px`,
                                    height: `${obstacle.height}px`,
                                    width: `${obstacle.width}px`,
                                }}
                                aria-hidden="true"
                            >
                                <span />
                                <span />
                                <span />
                            </div>
                        ))}

                        <div
                            className={`cold-start__runner ${
                                game.isJumping
                                    ? "cold-start__runner--jumping"
                                    : ""
                            } ${
                                game.gameOver
                                    ? "cold-start__runner--dead"
                                    : ""
                            }`}
                            style={{
                                left: `${PLAYER_X}px`,
                                top: `${game.playerY}px`,
                            }}
                            aria-hidden="true"
                        >
                            <div className="cold-start__runner-aura" />

                            <div className="cold-start__runner-head">
                                <span className="cold-start__eye cold-start__eye--left" />
                                <span className="cold-start__eye cold-start__eye--right" />
                            </div>

                            <div className="cold-start__runner-body">
                                <span className="cold-start__arm cold-start__arm--left" />
                                <span className="cold-start__arm cold-start__arm--right" />
                            </div>

                            <div className="cold-start__runner-leg cold-start__runner-leg--left" />
                            <div className="cold-start__runner-leg cold-start__runner-leg--right" />
                        </div>

                        <div
                            className="cold-start__ground"
                            aria-hidden="true"
                        />

                        {game.gameOver && (
                            <div className="cold-start__game-over">
                                <div>
                                    <Heart
                                        size={20}
                                        fill="currentColor"
                                    />

                                    <strong>
                                        RUN OVER
                                    </strong>

                                    <span>
                                        Score: {game.score}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={resetGame}
                                    >
                                        <RotateCcw size={15} />
                                        Run again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="cold-start__jump-button"
                        onClick={jump}
                        aria-label={
                            game.gameOver
                                ? "Restart game"
                                : "Jump"
                        }
                    >
                        {game.gameOver ? (
                            <>
                                <RotateCcw size={16} />
                                Restart
                            </>
                        ) : (
                            <>
                                <Zap size={16} />
                                JUMP
                            </>
                        )}
                    </button>

                    <div className="cold-start__hint">
                        <span>
                            SPACE / ↑ / W
                        </span>

                        <span>or</span>

                        <span>tap JUMP</span>
                    </div>
                </div>

                <div className="cold-start__footer">
                    <span className="cold-start__spinner" />

                    <span>
                        This screen disappears automatically
                        when the API responds.
                    </span>
                </div>
            </section>
        </div>
    );
}