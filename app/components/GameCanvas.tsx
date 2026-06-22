"use client";

import { useEffect, useRef } from "react";
import type { Bird, GameState, Pipe } from "../hooks/types";
import { WORLD_CONSTANTS } from "../hooks/useFlappyGame";

interface GameCanvasProps {
  state: GameState;
  bird: Bird;
  pipes: Pipe[];
  score: number;
  onFlap: () => void;
}

function ariaLabelFor(state: GameState, score: number): string {
  if (state === "START") return "Toca o pulsa espacio para empezar";
  if (state === "PLAYING") return `Puntuación ${score}`;
  return `Has perdido. Puntuación ${score}. Pulsa para reiniciar`;
}

export default function GameCanvas({
  state,
  bird,
  pipes,
  score,
  onFlap,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Dibuja el mundo según props. No contiene lógica de juego: solo render.
  const draw = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = container.clientWidth;
    const cssHeight = container.clientHeight;
    if (cssWidth <= 0 || cssHeight <= 0) return;

    if (
      canvas.width !== Math.round(cssWidth * dpr) ||
      canvas.height !== Math.round(cssHeight * dpr)
    ) {
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Cielo: degradado basado en el color de marca (--brand).
    const sky =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--brand")
        .trim() || "#2563eb";
    let grad: CanvasGradient | string = sky;
    try {
      const g = ctx.createLinearGradient(0, 0, 0, cssHeight);
      g.addColorStop(0, sky);
      g.addColorStop(1, "#7dd3fc");
      grad = g;
    } catch {
      grad = sky;
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Escalado del mundo -> canvas
    const worldW = WORLD_CONSTANTS.width;
    const worldH = WORLD_CONSTANTS.height;
    const scale = Math.min(cssWidth / worldW, cssHeight / worldH);
    const offsetX = (cssWidth - worldW * scale) / 2;
    const offsetY = (cssHeight - worldH * scale) / 2;

    const sx = (v: number) => offsetX + v * scale;
    const sy = (v: number) => offsetY + v * scale;
    const ss = (v: number) => v * scale;

    // Tuberías
    ctx.fillStyle = "#16a34a";
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = Math.max(1, ss(2));
    for (const p of pipes) {
      const x = sx(p.positionX);
      const w = ss(WORLD_CONSTANTS.pipeWidth);
      const gapTop = sy(p.gapPositionY);
      const gapH = ss(WORLD_CONSTANTS.pipeGap);
      const groundTop = sy(worldH - WORLD_CONSTANTS.groundHeight);
      ctx.fillRect(x, sy(0), w, gapTop);
      ctx.strokeRect(x, sy(0), w, gapTop);
      ctx.fillRect(x, gapTop + gapH, w, groundTop - (gapTop + gapH));
      ctx.strokeRect(x, gapTop + gapH, w, groundTop - (gapTop + gapH));
    }

    // Suelo
    ctx.fillStyle = "#65a30d";
    ctx.fillRect(
      offsetX,
      sy(worldH - WORLD_CONSTANTS.groundHeight),
      ss(worldW),
      ss(WORLD_CONSTANTS.groundHeight)
    );
    ctx.fillStyle = "#3f6212";
    ctx.fillRect(
      offsetX,
      sy(worldH - WORLD_CONSTANTS.groundHeight),
      ss(worldW),
      ss(8)
    );

    // Pájaro
    const birdSize = ss(36);
    const birdX = sx(120);
    const birdY = sy(bird.positionY);
    ctx.save();
    ctx.translate(birdX, birdY);
    ctx.rotate(bird.rotation);
    ctx.fillStyle = "#facc15";
    ctx.strokeStyle = "#854d0e";
    ctx.lineWidth = Math.max(1, ss(2));
    ctx.beginPath();
    ctx.arc(0, 0, birdSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ss(6), -ss(4), ss(4), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(ss(7), -ss(4), ss(2), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(ss(12), -ss(2));
    ctx.lineTo(ss(22), 0);
    ctx.lineTo(ss(12), ss(4));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    rafRef.current = raf;
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bird, pipes, state]);

  // Interacción: tap/clic y teclado.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handlePointer = (e: Event) => {
      e.preventDefault();
      onFlap();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        onFlap();
      }
    };
    canvas.addEventListener("pointerdown", handlePointer);
    window.addEventListener("keydown", handleKey);
    return () => {
      canvas.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onFlap]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Juego Flappy Bird"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "9 / 16",
        maxWidth: 480,
        marginInline: "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label={ariaLabelFor(state, score)}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "manipulation",
          cursor: "pointer",
        }}
      />
    </div>
  );
}