"use client";

import { useEffect, useState } from "react";
import GameCanvas from "./components/GameCanvas";
import StartScreen from "./components/StartScreen";
import ScoreDisplay from "./components/ScoreDisplay";
import GameOverScreen from "./components/GameOverScreen";
import { useFlappyGame } from "./hooks/useFlappyGame";

export default function HomePage() {
  const {
    state,
    bird,
    pipes,
    score,
    highScore,
    loading,
    storageError,
    isNewRecord,
    flap,
    start,
    restart,
  } = useFlappyGame();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const showLoadingOverlay = !mounted || loading;

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "var(--sp-4)",
        background: "var(--bg)",
      }}
    >
      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          width: "100%",
          maxWidth: 480,
        }}
      >
        <div style={{ position: "relative" }}>
          <GameCanvas
            state={state}
            bird={bird}
            pipes={pipes}
            score={score}
            onFlap={flap}
          />

          {/* Overlay de carga mientras se lee localStorage */}
          {showLoadingOverlay && state === "START" && (
            <div
              role="status"
              aria-live="polite"
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                pointerEvents: "none",
              }}
            >
              <p
                className="muted text-sm"
                style={{
                  background:
                    "color-mix(in srgb, var(--surface) 88%, transparent)",
                  padding: "var(--sp-2) var(--sp-4)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text)",
                }}
              >
                Cargando partida…
              </p>
            </div>
          )}

          {/* Pantalla de inicio */}
          {state === "START" && !showLoadingOverlay && (
            <StartScreen
              highScore={highScore}
              loading={loading}
              onStart={start}
            />
          )}

          {/* Marcador durante el juego */}
          {state === "PLAYING" && (
            <ScoreDisplay score={score} highScore={highScore} />
          )}

          {/* Pantalla de fin */}
          {state === "GAME_OVER" && (
            <GameOverScreen
              score={score}
              highScore={highScore}
              isNewRecord={isNewRecord}
              onRestart={restart}
            />
          )}
        </div>
      </div>

      {/* Alerta si localStorage falla */}
      {storageError && (
        <div
          className="alert alert-error"
          role="alert"
          style={{ marginTop: "var(--sp-4)", maxWidth: 480 }}
        >
          {storageError}
        </div>
      )}

      {/* H1 accesible (sr-only) para lectores de pantalla */}
      <h1 className="sr-only">Flappy Bird</h1>
    </main>
  );
}