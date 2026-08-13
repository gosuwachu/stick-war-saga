import type { CanvasDims, GameState } from './types';

function getCanvas(): HTMLCanvasElement {
  return document.getElementById("gameCanvas") as HTMLCanvasElement;
}

export function getCtx(): CanvasRenderingContext2D {
  return getCanvas().getContext("2d")!;
}

export function resizeCanvas(): CanvasDims {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const rect = getCanvas().parentElement!.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  return {
    width: canvas.width,
    height: canvas.height,
    groundY: canvas.height - 60,
    playerZone: { x1: 0, x2: canvas.width * 0.32 },
    enemyZone: { x1: canvas.width * 0.68, x2: canvas.width },
    battleZone: { x1: canvas.width * 0.25, x2: canvas.width * 0.75 },
    noMansLand: { x1: canvas.width * 0.30, x2: canvas.width * 0.70 },
  };
}

export function updateFormationPositions(state: GameState, dims: CanvasDims): void {
  const py = dims.groundY - 10;
  let midx = 0, sidx = 0;
  state.player.units.forEach(u => {
    if (u.state === 'dead' || u.state === 'dying') return;
    if (u.isMiner) {
      u.formationX = dims.width * 0.02 + midx * 18;
      u.formationY = py + 8;
      midx++;
    } else {
      u.formationX = dims.width * 0.08 + Math.floor(sidx / 5) * 28 + (sidx % 5) * 20;
      u.formationY = py - Math.floor(sidx / 5) * 4;
      sidx++;
    }
  });
  let emidx = 0, esidx = 0;
  state.enemy.units.forEach(u => {
    if (u.state === 'dead' || u.state === 'dying') return;
    if (u.isMiner) {
      u.formationX = dims.width * 0.96 - emidx * 18;
      u.formationY = py + 8;
      emidx++;
    } else {
      u.formationX = dims.width * 0.88 - Math.floor(esidx / 5) * 28 - (esidx % 5) * 20;
      u.formationY = py - Math.floor(esidx / 5) * 4;
      esidx++;
    }
  });
}
