import { rand, UNIT_ORDER, UNIT_TYPES } from './config';
import { createUnit } from './factory';
import type { CanvasDims, GameState, UnitType } from './types';

export function aiUpdate(dt: number, state: GameState, dims: CanvasDims): void {
  if (state.phase !== 'prep' || state.mode === 'pvp') return;

  const buyInterval = Math.max(1.5, 3.5 - state.wave * 0.12);
  if (!state._aiTimer) state._aiTimer = 0;
  state._aiTimer += dt;

  if (state._aiTimer >= buyInterval) {
    state._aiTimer = 0;
    aiBuyUnit(state, dims);
  }
}

export function aiBuyUnit(state: GameState, dims: CanvasDims, wave?: number): void {
  wave = wave || state.wave;
  const affordable = UNIT_ORDER.filter(t => UNIT_TYPES[t].cost <= state.enemy.gold);
  if (affordable.length === 0) return;

  const counts: Partial<Record<UnitType, number>> = {};
  state.enemy.units.forEach(u => { counts[u.type] = (counts[u.type] || 0) + 1; });

  const weights = affordable.map(t => {
    let w = 1;
    const count = counts[t] || 0;
    if (count > 3) w *= 0.3;
    if (count > 5) w *= 0.2;
    if (count === 0) w *= 2;
    if (t === 'Giant' && wave! > 3) w *= 1.5;
    if (t === 'Mage' && wave! > 2) w *= 1.3;
    if (t === 'Archer') w *= 1.2;
    if (t === 'Knight' && wave! > 2) w *= 1.4;
    if (t === 'Miner' && (counts[t] || 0) >= 6) w = 0;
    return w;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  let chosen = affordable[0];
  for (let i = 0; i < affordable.length; i++) {
    r -= weights[i];
    if (r <= 0) { chosen = affordable[i]; break; }
  }

  if (UNIT_TYPES[chosen].cost <= state.enemy.gold) {
    state.enemy.gold -= UNIT_TYPES[chosen].cost;
    const u = createUnit(chosen, 'enemy', dims.width * 0.90 + rand(-15, 15), dims.groundY - 10 + rand(-3, 3));
    state.enemy.units.push(u);
  }
}
