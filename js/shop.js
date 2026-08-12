// ====================================================================
//  SHOP UI
// ====================================================================
function buildShop() {
  const container = document.getElementById('shop-units');
  container.innerHTML = '';
  UNIT_ORDER.forEach(type => {
    const def = UNIT_TYPES[type];
    const card = document.createElement('div');
    card.className = 'unit-card';
    card.dataset.type = type;

    const iconColors = {
      Miner: '#8B7355', Swordsman: '#78909C', Archer: '#66BB6A',
      Spearman: '#AB47BC', Knight: '#FFA726', Mage: '#42A5F5',
      Giant: '#8D6E63', Healer: '#EF5350'
    };
    const icons = { Miner: '\u26CF', Swordsman: '\uD83D\uDDE1', Archer: '\uD83C\uDFF9', Spearman: '\uD83D\uDD31', Knight: '\u2694', Mage: '\uD83D\uDD2E', Giant: '\uD83D\uDCAA', Healer: '\uD83D\uDC9A' };

    card.innerHTML = `
      <div class="icon" style="background:${iconColors[type]}22; color:${iconColors[type]}">${icons[type]}</div>
      <div class="info">
        <div class="name">${def.label}</div>
        <div class="stats">${def.desc}</div>
      </div>
      <span class="cost">${def.cost}g</span>
      <span class="count" id="count-${type}">0</span>
    `;

    card.addEventListener('click', () => { if (game.mode !== 'pvp') buyUnit(type, 'player'); });
    container.appendChild(card);
  });
}

function buyUnit(type, team, state) {
  state = state || game;
  if (state.phase !== 'prep') return;
  const def = UNIT_TYPES[type];
  const gold = team === 'player' ? state.player.gold : state.enemy.gold;
  const units = team === 'player' ? state.player.units : state.enemy.units;
  if (gold < def.cost) return;

  if (team === 'player') {
    state.player.gold -= def.cost;
  } else {
    state.enemy.gold -= def.cost;
  }
  const u = createUnit(type, team, 0, 0);
  units.push(u);
  if (typeof updateFormationPositions !== 'undefined') updateFormationPositions();
  u.x = u.formationX;
  u.y = u.formationY;
  if (typeof updateShop !== 'undefined') updateShop();
  if (typeof updateHUD !== 'undefined') updateHUD();
  if (typeof updateArmyPreview !== 'undefined') updateArmyPreview();
}

function updateShop() {
  const isPvP = game.mode === 'pvp';
  const container = document.getElementById('shop-units');
  const cards = container.querySelectorAll('.unit-card');
  cards.forEach(card => {
    const type = card.dataset.type;
    const cost = UNIT_TYPES[type].cost;
    const p1Count = game.player.units.filter(u => u.type === type && u.state !== 'dead').length;
    const p2Count = game.enemy.units.filter(u => u.type === type && u.state !== 'dead').length;
    const p1CanBuy = game.player.gold >= cost;
    const disabled = game.phase !== 'prep' || (!isPvP && !p1CanBuy);
    card.classList.toggle('disabled', disabled);

    const p1Key = Object.keys(P1_KEYS).find(k => P1_KEYS[k] === type);
    const p2Key = Object.keys(P2_KEYS).find(k => P2_KEYS[k] === type);

    card.querySelector('.cost').innerHTML = isPvP
      ? `${cost}g <span style="font-size:9px;opacity:0.5">P1:${p1Count} / P2:${p2Count}</span>`
      : `${cost}g <span style="font-size:9px;opacity:0.5">x${p1Count}</span>`;

    if (isPvP) {
      card.style.cursor = 'default';
      card.style.pointerEvents = 'none';
    } else {
      card.style.cursor = p1CanBuy ? 'pointer' : 'not-allowed';
      card.style.pointerEvents = 'auto';
    }
  });

  const p1Total = game.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length;
  const p2Total = game.enemy.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length;
  document.getElementById('shop-total').textContent = isPvP
    ? 'P1:' + p1Total + '  P2:' + p2Total
    : p1Total + ' units';
  document.getElementById('shop-income').textContent = isPvP
    ? 'P1:+' + game.player.income + 'g  P2:+' + game.enemy.income + 'g'
    : '+' + game.player.income + 'g/s';

  if (isPvP) {
    document.getElementById('shop-phase-status').textContent =
      game.phase === 'prep' ? 'P1:1qazxsw2  P2:=[;.,lp-' : game.phase === 'battle' ? 'Battle!' : '...';
  } else {
    document.getElementById('shop-phase-status').textContent =
      game.phase === 'prep' ? 'Click or press key to buy' : game.phase === 'battle' ? 'Battle in progress...' : '...';
  }
}

// ====================================================================
//  HUD
// ====================================================================
function updateHUD() {
  const isPvP = game.mode === 'pvp';

  document.getElementById('hud-p1-gold').querySelector('.label').textContent = isPvP ? 'P1 Gold' : 'Gold';
  document.getElementById('hud-p1-army').querySelector('.label').textContent = isPvP ? 'P1 Army' : 'Army';

  if (isPvP) {
    document.getElementById('hud-p2-gold').style.display = '';
    document.getElementById('hud-p2-army').style.display = '';
  } else {
    document.getElementById('hud-p2-gold').style.display = 'none';
    document.getElementById('hud-p2-army').style.display = 'none';
  }

  if (isPvP) {
    document.getElementById('hud-wave-item').style.display = '';
    document.getElementById('hud-wave').textContent = 'R' + game.pvpRound + '/' + game.pvpMaxRounds + '  ' + game.pvpScore.p1 + '-' + game.pvpScore.p2;
  } else {
    document.getElementById('hud-wave').textContent = game.wave;
  }

  const timerEl = document.getElementById('hud-timer');
  const phaseLabel = document.getElementById('hud-phase-label');

  if (game.phase === 'prep') {
    phaseLabel.textContent = 'Prep';
    timerEl.textContent = Math.ceil(game.prepTimer);
    timerEl.className = 'value timer-value' + (game.prepTimer <= 5 ? ' urgent' : '');
  } else if (game.phase === 'battle') {
    phaseLabel.textContent = 'Fight';
    timerEl.textContent = Math.floor(game.battleTimer);
    timerEl.className = 'value timer-value';
  } else {
    phaseLabel.textContent = '--';
    timerEl.textContent = '--';
  }

  document.getElementById('hud-gold').textContent = Math.floor(game.player.gold);
  const p1Alive = game.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length;
  document.getElementById('hud-army').textContent = p1Alive;

  document.getElementById('hud-enemy-gold').textContent = Math.floor(game.enemy.gold);
  const p2Alive = game.enemy.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length;
  document.getElementById('hud-enemy-army').textContent = p2Alive;
}

// ====================================================================
//  ARMY PREVIEW
// ====================================================================
function updateArmyPreview() {
  const container = document.getElementById('army-preview');
  container.innerHTML = '';
  const alive = game.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying');
  const colors = {
    Miner: '#8B7355', Swordsman: '#78909C', Archer: '#66BB6A',
    Spearman: '#AB47BC', Knight: '#FFA726', Mage: '#42A5F5',
    Giant: '#8D6E63', Healer: '#EF5350'
  };
  alive.forEach(u => {
    const dot = document.createElement('div');
    dot.className = 'army-dot';
    dot.style.background = colors[u.type] || '#666';
    if (u.team === 'enemy') dot.style.opacity = '0.4';
    container.appendChild(dot);
  });
}
