export type GameState = "START" | "PLAYING" | "GAME_OVER";

export interface Bird {
  positionY: number;
  velocity: number;
  rotation: number;
}

export interface Pipe {
  id: string;
  positionX: number;
  gapPositionY: number;
  passed: boolean;
}

export interface GameData {
  state: GameState;
  bird: Bird;
  pipes: Pipe[];
  score: number;
  highScore: number;
}