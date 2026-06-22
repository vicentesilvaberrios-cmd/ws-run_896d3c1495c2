"use client";

import { useEffect, useRef } from "react";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
}

export default function GameOverScreen({
  score,
  highScore,
  isNewRecord,
  onRestart,
}: GameOverScreenProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-labelledby="gameover-title"
      aria-live="polite"
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        padding: "var(--sp-4)",
        pointerEvents: "none",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 360,
          width: "100%",
          textAlign: "center",
          padding: "var(--sp-6)",
          background:
            "color-mix(in srgb, var(--surface) 92%, transparent)",
          backdropFilter: "blur(6px)",
          pointerEvents: "auto",
        }}
      >
        <h2
          id="gameover-title"
          style={{
            fontSize: "var(--fs-2xl)",
            marginBottom: "var(--sp-4)",
          }}
        >
          ¡Fin de la partida!
        </h2>

        <div
          className="kpi"
          style={{ marginBottom: "var(--sp-3)" }}
        >
          <span className="value">{score}</span>
          <span className="label">Puntuación</span>
        </div>

        {isNewRecord && (
          <div style={{ marginBottom: "var(--sp-3)" }}>
            <span className="badge badge-ok">¡Nuevo récord!</span>
          </div>
        )}

        <div
          className="kpi"
          style={{ marginBottom: "var(--sp-5)" }}
        >
          <span className="value">{highScore}</span>
          <span className="label">Mejor puntuación</span>
        </div>

        <button
          ref={buttonRef}
          type="button"
          className="btn btn-primary btn-block"
          onClick={onRestart}
          aria-label="Volver a jugar"
        >
          Volver a jugar
        </button>

        <p
          className="text-sm muted"
          style={{ marginTop: "var(--sp-4)", marginBottom: 0 }}
        >
          Pulsa <strong>Espacio</strong> o toca la pantalla para reiniciar.
        </p>
      </div>
    </div>
  );
}