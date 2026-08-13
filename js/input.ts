import { P1_KEYS, P2_KEYS } from './config';
import { buyUnit } from './shop';
import type { CanvasDims, GameState } from './types';

let _inputState: GameState | null = null;
let _inputDims: CanvasDims | null = null;

export function setInputState(state: GameState): void {
  _inputState = state;
}

export function setInputDims(dims: CanvasDims): void {
  _inputDims = dims;
}

document.addEventListener('keydown', (e: KeyboardEvent) => {
  const s = _inputState;
  const d = _inputDims;
  if (!s || !d || s.phase !== 'prep') return;
  const p1Type = P1_KEYS[e.key];
  if (p1Type) {
    e.preventDefault();
    buyUnit(p1Type, 'player', s, d);
    return;
  }
  if (s.mode === 'pvp') {
    const p2Type = P2_KEYS[e.key];
    if (p2Type) {
      e.preventDefault();
      buyUnit(p2Type, 'enemy', s, d);
    }
  }
});
