"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Bird, GameData, GameState, Pipe } from "./types";

const STORAGE_KEY = "flappy.highScore";

const WORLD = {
  width: 480,
  height: 854,
  gravity: 0.45,
  flapImpulse: -8,
  pipeWidth: 70,
  pipeGap: 170,
  pipeIntervalMs: 1500,
  pipeSpeed: 2.4,
  groundHeight: 80,
};

function createBird(): Bird {
  return {
    positionY: WORLD.height / 2 - WORLD.groundHeight / 2,
    velocity: 0,
    rotation: 0,
  };
}

function createPipe(positionX: number, gapPositionY: number): Pipe {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    positionX,
    gapPositionY,
    passed: false,
  };
}

function safeReadHighScore(): { value: number; error: string | null } {
  if (typeof window === "undefined") return { value: 0, error: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const n = raw == null ? 0 : parseInt(raw, 10);
    return { value: Number.isFinite(n) && n > 0 ? n : 0, error: null };
  } catch {
    return {
      value: 0,
      error:
        "No pudimos guardar tu récord, pero puedes jugar.",
    };
  }
}

function safeWriteHighScore(value: number): string | null {
  if (typeof window === "undefined") return null;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
    return null;
  } catch {
    return "No pudimos guardar tu récord, pero puedes jugar.";
  }
}

export interface UseFlappyGame {
  state: GameState;
  bird: Bird;
  pipes: Pipe[];
  score: number;
  highScore: number;
  loading: boolean;
  storageError: string | null;
  isNewRecord: boolean;
  flap: () => void;
  start: () => void;
  restart: () => void;
}

export function useFlappyGame(): UseFlappyGame {
  const [state, setState] = useState<GameState>("START");
  const [bird, setBird] = useState<Bird>(createBird);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Refs para evitar closures obsoletas dentro del loop de juego.
  const stateRef = useRef<GameState>("START");
  const birdRef = useRef<Bird>(createBird());
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const lastPipeSpawnRef = useRef(0);

  // Lectura inicial del récord.
  useEffect(() => {
    const { value, error } = safeReadHighScore();
    setHighScore(value);
    if (error) setStorageError(error);
    setLoading(false);
  }, []);

  const resetWorld = useCallback(() => {
    const freshBird = createBird();
    birdRef.current = freshBird;
    pipesRef.current = [];
    scoreRef.current = 0;
    lastPipeSpawnRef.current = 0;
    setBird(freshBird);
    setPipes([]);
    setScore(0);
    setIsNewRecord(false);
  }, []);

  const start = useCallback(() => {
    resetWorld();
    stateRef.current = "PLAYING";
    setState("PLAYING");
  }, [resetWorld]);

  const restart = useCallback(() => {
    resetWorld();
    stateRef.current = "PLAYING";
    setState("PLAYING");
  }, [resetWorld]);

  const flap = useCallback(() => {
    const current = stateRef.current;
    if (current === "START") {
      resetWorld();
      stateRef.current = "PLAYING";
      birdRef.current = { ...birdRef.current, velocity: WORLD.flapImpulse };
      setBird(birdRef.current);
      setState("PLAYING");
      return;
    }
    if (current === "PLAYING") {
      birdRef.current = { ...birdRef.current, velocity: WORLD.flapImpulse };
      setBird({ ...birdRef.current });
      return;
    }
    if (current === "GAME_OVER") {
      resetWorld();
      stateRef.current = "PLAYING";
      setState("PLAYING");
    }
  }, [resetWorld]);

  // Loop principal: solo se monta durante PLAYING.
  useEffect(() => {
    if (state !== "PLAYING") return;
    let frame = 0;
    let raf = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      frame += dt;

      // Física del pájaro
      const b = birdRef.current;
      const velocity = b.velocity + WORLD.gravity * (dt / 16);
      const positionY = b.positionY + velocity * (dt / 16);
      const rotation = Math.max(-0.5, Math.min(1.4, velocity * 0.06));
      const updatedBird: Bird = { positionY, velocity, rotation };
      birdRef.current = updatedBird;

      // Spawn de tuberías cada 1.5s
      if (now - lastPipeSpawnRef.current > WORLD.pipeIntervalMs) {
        lastPipeSpawnRef.current = now;
        const minGapY = 120;
        const maxGapY = WORLD.height - WORLD.groundHeight - WORLD.pipeGap - 120;
        const gapPositionY =
          minGapY + Math.random() * Math.max(0, maxGapY - minGapY);
        pipesRef.current = [
          ...pipesRef.current,
          createPipe(WORLD.width + WORLD.pipeWidth, gapPositionY),
        ];
      }

      // Mover tuberías y contar puntos
      let passedDelta = 0;
      const movedPipes = pipesRef.current
        .map((p) => ({ ...p, positionX: p.positionX - WORLD.pipeSpeed * (dt / 16) }))
        .filter((p) => {
          if (!p.passed && p.positionX + WORLD.pipeWidth < 120) {
            passedDelta += 1;
            return { ...p, passed: true } as Pipe;
          }
          return true;
        })
        .map((p): Pipe => {
          if (!p.passed && p.positionX + WORLD.pipeWidth < 120) {
            return { ...p, passed: true };
          }
          return p;
        });

      pipesRef.current = movedPipes;
      if (passedDelta > 0) {
        scoreRef.current += passedDelta;
      }

      // Colisiones: suelo / techo
      const ceiling = 0;
      const ground = WORLD.height - WORLD.groundHeight;
      let crashed =
        updatedBird.positionY + 20 >= ground || updatedBird.positionY - 20 <= ceiling;

      // Colisiones con tuberías
      const birdX = 120;
      const birdLeft = birdX - 18;
      const birdRight = birdX + 18;
      if (!crashed) {
        for (const p of pipesRef.current) {
          const pipeLeft = p.positionX;
          const pipeRight = p.positionX + WORLD.pipeWidth;
          const gapTop = p.gapPositionY;
          const gapBottom = p.gapPositionY + WORLD.pipeGap;
          const overlapsX = birdRight > pipeLeft && birdLeft < pipeRight;
          if (overlapsX) {
            const birdTop = updatedBird.positionY - 18;
            const birdBottom = updatedBird.positionY + 18;
            if (birdTop < gapTop || birdBottom > gapBottom) {
              crashed = true;
              break;
            }
          }
        }
      }

      if (crashed) {
        // Game over: persistir récord si procede
        const finalScore = scoreRef.current;
        let nextHigh = highScore;
        let newRecord = false;
        if (finalScore > highScore) {
          nextHigh = finalScore;
          newRecord = true;
        }
        stateRef.current = "GAME_OVER";
        setBird(updatedBird);
        setPipes(movedPipes);
        setScore(finalScore);
        setHighScore(nextHigh);
        setIsNewRecord(newRecord);
        setState("GAME_OVER");
        if (newRecord) {
          const err = safeWriteHighScore(nextHigh);
          if (err) setStorageError(err);
        }
        return;
      }

      setBird(updatedBird);
      setPipes(movedPipes);
      if (passedDelta > 0) setScore(scoreRef.current);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // highScore se lee por closure; solo necesitamos reaccionar a cambios de state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return {
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
  };
}

export const WORLD_CONSTANTS = WORLD;