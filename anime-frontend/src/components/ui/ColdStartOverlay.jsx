import { useCallback, useEffect, useRef, useState } from "react";
import { Gamepad2, MousePointer2, Zap } from "lucide-react";
import "./cold-start-overlay.css";

const TARGET_COUNT = 5;

function createTarget() {
    return {
        x: 15 + Math.random() * 70,
        y: 18 + Math.random() * 52,
        id:
            globalThis.crypto?.randomUUID?.() ??
            `${Date.now()}-${Math.random()}`,
    };
}

export default function ColdStartOverlay() {
    const [visible, setVisible] = useState(false);
    const [target, setTarget] = useState(createTarget);
    const [score, setScore] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    const slowRequests = useRef(0);
    const startedAt = useRef(null);
    const timerRef = useRef(null);

    const resetGame = useCallback(() => {
        setScore(0);
        setTarget(createTarget());
    }, []);

    useEffect(() => {
        const handleColdStart = (event) => {
            const { type, count = 0 } = event.detail ?? {};

            if (type === "start") {
                slowRequests.current = count;
                startedAt.current ??= performance.now();
                setVisible(true);
                resetGame();
                return;
            }

            if (type === "end") {
                slowRequests.current = count;

                if (count <= 0) {
                    slowRequests.current = 0;
                    startedAt.current = null;
                    setVisible(false);
                    setElapsed(0);
                }
            }
        };

        window.addEventListener("anime-tracker:cold-start", handleColdStart);

        return () => {
            window.removeEventListener("anime-tracker:cold-start", handleColdStart);
        };
    }, [resetGame]);

    useEffect(() => {
        if (!visible) return undefined;

        timerRef.current = window.setInterval(() => {
            if (!startedAt.current) return;

            setElapsed(
                Math.floor((performance.now() - startedAt.current) / 1000)
            );
        }, 250);

        return () => window.clearInterval(timerRef.current);
    }, [visible]);

    const collectTarget = () => {
        setScore((current) => Math.min(current + 1, TARGET_COUNT));
        setTarget(createTarget());
    };

    if (!visible) return null;

    return (
        <div className="cold-start" role="status" aria-live="polite">
            <div className="cold-start__backdrop" />

            <section
                className="cold-start__panel"
                aria-label="Anime Tracker backend waking up"
            >
                <div className="cold-start__energy cold-start__energy--one" />
                <div className="cold-start__energy cold-start__energy--two" />

                <div className="cold-start__icon" aria-hidden="true">
                    <Zap size={28} strokeWidth={2.5} />
                </div>

                <p className="cold-start__eyebrow">ANIME TRACKER</p>
                <h2>
                    Waking up the server
                    <span className="cold-start__dots">...</span>
                </h2>

                <p className="cold-start__message">
                    The backend is taking a quick nap 😴. This demo uses
                    Render&apos;s free hosting, so the first request after
                    inactivity can take about a minute.
                </p>

                <div className="cold-start__status">
                    <span className="cold-start__pulse" />
                    <span>Waiting for the API response</span>
                    <span className="cold-start__time">{elapsed}s</span>
                </div>

                <div
                    className="cold-start__game"
                    aria-label="Mini game: collect energy orbs"
                >
                    <div className="cold-start__game-header">
                        <span>
                            <Gamepad2 size={16} />
                            Power-up while you wait
                        </span>
                        <strong>
                            {score}/{TARGET_COUNT}
                        </strong>
                    </div>
                    <p>Catch the moving energy orb.</p>

                    <div className="cold-start__arena">
                        <button
                            type="button"
                            className="cold-start__orb"
                            style={{ left: `${target.x}%`, top: `${target.y}%` }}
                            onClick={collectTarget}
                            aria-label="Collect energy orb"
                        >
                            ✦
                        </button>

                        <div className="cold-start__mascot" aria-hidden="true">
                            ◉‿◉
                        </div>
                    </div>

                    <div className="cold-start__hint">
                        <MousePointer2 size={14} />
                        Click the orb to charge the tracker
                    </div>
                </div>

                <div className="cold-start__footer">
                    <span className="cold-start__spinner" />
                    <span>
                        This screen disappears automatically when the API
                        responds.
                    </span>
                </div>
            </section>
        </div>
    );
}
