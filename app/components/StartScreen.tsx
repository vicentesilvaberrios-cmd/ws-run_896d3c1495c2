"use client";

import { useEffect, useRef } from "react";

interface StartScreenProps {
  highScore: number;
  loading: boolean;
  onStart: () => void;
}

export default function StartScreen({ highScore, loading, onStart }: StartScreenProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // Mueve foco al botón primario al entrar al estado.
    buttonRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-labelledby="start-title"
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
        {highScore > 0 && (
          <div style={{ marginBottom: "var(--sp-3)" }}>
            <span className="badge badge-info">Récord: {highScore}</span>
          </div>
        )}

        <h1
          id="start-title"
          style={{
            fontSize: "var(--fs-3xl)",
            marginBottom: "var(--sp-3)",
          }}
        >
          Flappy Bird
        </h1>

        <p className="muted" style={{ marginBottom: "var(--sp-2)" }}>
          Salta entre las tuberías sin chocar.
        </p>

        <p
          className="text-sm muted"
          style={{ marginBottom: "var(--sp-5)" }}
        >
          Toca la pantalla, haz clic o pulsa{" "}
          <strong>Espacio</strong> para volar.
        </p>

        <button
          ref={buttonRef}
          type="button"
          className="btn btn-primary btn-block"
          onClick={onStart}
          disabled={loading}
          aria-label="Empezar a jugar"
        >
          {loading ? "Cargando…" : "Empezar a jugar"}
        </button>
      </div>
    </div>
  );
}