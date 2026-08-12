// ====================================================================
//  UNIT FACTORY
// ====================================================================
function createUnit(type, team, x, y) {
  const def = UNIT_TYPES[type];
  const isGiant = type === 'Giant';
  const scale = isGiant ? 1.8 : 1;

  return {
    type,
    team,
    x, y,
    hp: def.hp,
    maxHp: def.hp,
    dmg: def.dmg,
    range: def.range,
    speed: def.speed,
    atkCd: def.atkCd,
    income: def.income,
    scale,
    state: 'idle',
    atkTimer: 0,
    target: null,
    dir: team === 'player' ? 1 : -1,
    wanderPhase: rand(0, Math.PI * 2),
    animTime: 0,
    deathTimer: 0,
    attackAnim: 0,
    isGiant,
    isHealer: type === 'Healer',
    isMiner: type === 'Miner',
    isRanged: type === 'Archer' || type === 'Mage',
    formationX: x,
    formationY: y,
    killCount: 0,
    splash: type === 'Mage',
    healPower: type === 'Healer' ? 8 : 0,
  };
}
