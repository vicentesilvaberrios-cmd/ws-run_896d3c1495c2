"use client";

interface ScoreDisplayProps {
  score: number;
  highScore: number;
}

export default function ScoreDisplay({ score, highScore }: ScoreDisplayProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "var(--sp-4)",
        pointerEvents: "none",
      }}
    >
      {highScore > 0 && (
        <div
          style={{
            position: "absolute",
            top: "var(--sp-3)",
            left: "var(--sp-3)",
          }}
        >
          <span className="badge badge-info">Récord: {highScore}</span>
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          top: "var(--sp-3)",
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#ffffff",
          fontSize: "var(--fs-3xl)",
          fontWeight: 700,
          textShadow: "0 2px 6px rgba(0,0,0,0.45)",
        }}
      >
        {score}
      </div>
    </div>
  );
}