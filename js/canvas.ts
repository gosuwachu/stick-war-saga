import { game } from './config';
import type { GameState, } from './types';

export let W: number = 0;
export let H: number = 0;
export let GROUND_Y: number = 0;

function getCanvas(): HTMLCanvasElement {
  return document.getElementById("gameCanvas") as HTMLCanvasElement;
}

export function getCtx(): CanvasRenderingContext2D {
  return getCanvas().getContext("2d")!;
}

export const PLAYER_ZONE  = { x1: 0, x2: 0 };
export const ENEMY_ZONE   = { x1: 0, x2: 0 };
export const BATTLE_ZONE  = { x1: 0, x2: 0 };
export const NO_MANS_LAND = { x1: 0, x2: 0 };

export function resizeCanvas(): void {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const rect = getCanvas().parentElement!.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  W = canvas.width;
  H = canvas.height;
  GROUND_Y = H - 60;

  PLAYER_ZONE.x1 = 0; PLAYER_ZONE.x2 = W * 0.32;
  ENEMY_ZONE.x1 = W * 0.68; ENEMY_ZONE.x2 = W;
  BATTLE_ZONE.x1 = W * 0.25; BATTLE_ZONE.x2 = W * 0.75;
  NO_MANS_LAND.x1 = W * 0.30; NO_MANS_LAND.x2 = W * 0.70;
}

export function updateFormationPositions(state?: GameState, canvasW?: number, groundY?: number): void {
  state = state || game;
  canvasW = canvasW || W;
  groundY = groundY || GROUND_Y;
  const py = groundY - 10;
  let midx = 0, sidx = 0;
  state.player.units.forEach(u => {
    if (u.state === 'dead' || u.state === 'dying') return;
    if (u.isMiner) {
      u.formationX = canvasW! * 0.02 + midx * 18;
      u.formationY = py + 8;
      midx++;
    } else {
      u.formationX = canvasW! * 0.08 + Math.floor(sidx / 5) * 28 + (sidx % 5) * 20;
      u.formationY = py - Math.floor(sidx / 5) * 4;
      sidx++;
    }
  });
  let emidx = 0, esidx = 0;
  state.enemy.units.forEach(u => {
    if (u.state === 'dead' || u.state === 'dying') return;
    if (u.isMiner) {
      u.formationX = canvasW! * 0.96 - emidx * 18;
      u.formationY = py + 8;
      emidx++;
    } else {
      u.formationX = canvasW! * 0.88 - Math.floor(esidx / 5) * 28 - (esidx % 5) * 20;
      u.formationY = py - Math.floor(esidx / 5) * 4;
      esidx++;
    }
  });
}
