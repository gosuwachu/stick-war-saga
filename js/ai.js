// ====================================================================
//  ENEMY AI
// ====================================================================
function aiUpdate(dt) {
  if (game.phase !== 'prep' || game.mode === 'pvp') return;

  const buyInterval = Math.max(1.5, 3.5 - game.wave * 0.12);
  if (!game._aiTimer) game._aiTimer = 0;
  game._aiTimer += dt;

  if (game._aiTimer >= buyInterval) {
    game._aiTimer = 0;
    aiBuyUnit();
  }
}

function aiBuyUnit() {
  const affordable = UNIT_ORDER.filter(t => t !== 'Miner' && UNIT_TYPES[t].cost <= game.enemy.gold);
  if (affordable.length === 0) return;

  const counts = {};
  game.enemy.units.forEach(u => { counts[u.type] = (counts[u.type] || 0) + 1; });

  let weights = affordable.map(t => {
    let w = 1;
    const count = counts[t] || 0;
    if (count > 3) w *= 0.3;
    if (count > 5) w *= 0.2;
    if (count === 0) w *= 2;
    if (t === 'Giant' && game.wave > 3) w *= 1.5;
    if (t === 'Mage' && game.wave > 2) w *= 1.3;
    if (t === 'Archer') w *= 1.2;
    if (t === 'Knight' && game.wave > 2) w *= 1.4;
    return w;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  let chosen = affordable[0];
  for (let i = 0; i < affordable.length; i++) {
    r -= weights[i];
    if (r <= 0) { chosen = affordable[i]; break; }
  }

  if (UNIT_TYPES[chosen].cost <= game.enemy.gold) {
    game.enemy.gold -= UNIT_TYPES[chosen].cost;
    const u = createUnit(chosen, 'enemy', W * 0.90 + rand(-15, 15), GROUND_Y - 10 + rand(-3, 3));
    game.enemy.units.push(u);
    updateHUD();
  }
}
