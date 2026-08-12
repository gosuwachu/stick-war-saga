import { game, P1_KEYS, P2_KEYS } from './config';
import { buyUnit } from './shop';

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (game.phase !== 'prep') return;
  const p1Type = P1_KEYS[e.key];
  if (p1Type) {
    e.preventDefault();
    buyUnit(p1Type, 'player');
    return;
  }
  if (game.mode === 'pvp') {
    const p2Type = P2_KEYS[e.key];
    if (p2Type) {
      e.preventDefault();
      buyUnit(p2Type, 'enemy');
    }
  }
});
