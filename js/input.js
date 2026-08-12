// ====================================================================
//  KEYBOARD INPUT
// ====================================================================
document.addEventListener('keydown', (e) => {
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
