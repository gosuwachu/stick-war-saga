// ====================================================================
//  PHASE TRANSITIONS
// ====================================================================
function startPrep() {
  game.phase = 'prep';
  game.prepTimer = game.prepTime;

  game.player.units.forEach(u => { u.state = 'idle'; u.target = null; });
  game.enemy.units.forEach(u => { u.state = 'idle'; u.target = null; });
  updateFormationPositions();
  game.player.units.forEach(u => { u.x = u.formationX; u.y = u.formationY; });
  game.enemy.units.forEach(u => { u.x = u.formationX; u.y = u.formationY; });

  game.projectiles = [];
  if (game.mode === 'pvp') {
    showBanner('ROUND ' + game.pvpRound, 'BUILD YOUR ARMY  |  ' + game.pvpScore.p1 + '-' + game.pvpScore.p2, '#64b5f6');
  } else {
    showBanner('PREPARE', 'Wave ' + game.wave + '  |  Buy your army!', '#64b5f6');
  }
  updateShop();
  updateHUD();
}

function startBattle() {
  game.phase = 'battle';
  game.battleTimer = 0;
  game.player.units.forEach(u => { if (!u.isMiner) u.state = 'marching'; });
  game.enemy.units.forEach(u => { if (!u.isMiner) u.state = 'marching'; });
  showBanner('BATTLE', 'Fight!', '#ff8a80');
  document.getElementById('shop-panel').classList.add('hidden');
  updateHUD();
}

function endBattle(winner) {
  game.phase = 'transition';
  game.transitionTimer = 3;
  if (game.mode === 'pvp') {
    if (winner === 'player') game.pvpScore.p1++;
    else game.pvpScore.p2++;
    if (game.pvpRound >= game.pvpMaxRounds) {
      const matchWinner = game.pvpScore.p1 > game.pvpScore.p2 ? 'Player 1' : 'Player 2';
      showBanner(matchWinner + ' WINS THE MATCH!', game.pvpScore.p1 + ' - ' + game.pvpScore.p2, '#ffd700');
    } else {
      showBanner('ROUND ' + game.pvpRound + ' COMPLETE', 'Player ' + (winner === 'player' ? '1' : '2') + ' wins  (' + game.pvpScore.p1 + '-' + game.pvpScore.p2 + ')', '#64b5f6');
    }
    game.pvpRound++;
  } else {
    if (winner === 'player') {
      const bonus = 80 + game.wave * 20;
      game.player.gold += bonus;
      game.player.units.forEach(u => { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.3); });
      showBanner('VICTORY', 'Wave ' + game.wave + ' cleared! +' + bonus + ' gold', '#81c784');
    } else {
      showBanner('DEFEAT', 'Your army has fallen...', '#ff8a80');
    }
  }
  updateHUD();
}

function showBanner(title, sub, color) {
  const el = document.getElementById('banner');
  document.getElementById('banner-title').textContent = title;
  document.getElementById('banner-title').style.color = color;
  document.getElementById('banner-sub').textContent = sub;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ====================================================================
//  ENEMY WAVE / ROUND RESET
// ====================================================================
function spawnEnemyWave() {
  if (game.mode === 'pvp') {
    game.enemy.gold = 400;
    game.enemy.income = 0;
    game.enemy.units = [];
    for (let i = 0; i < 3; i++) {
      game.enemy.units.push(createUnit('Miner', 'enemy', 0, 0));
    }
  } else {
    const wave = game.wave;
    const startingGold = 150 + wave * 80;
    game.enemy.gold = startingGold;
    game.enemy.income = 0;
    game.enemy.units = [];
    const minerCount = Math.min(2 + Math.floor(wave / 2), 8);
    for (let i = 0; i < minerCount; i++) {
      game.enemy.units.push(createUnit('Miner', 'enemy', 0, 0));
    }
  }
  updateHUD();
  startPrep();
}

function resetPvPRound() {
  game.player.gold = 400;
  game.enemy.gold = 400;
  game.player.income = 0;
  game.enemy.income = 0;
  game.player.units = [];
  game.enemy.units = [];
  game.projectiles = [];
  game.particles = [];
  game.floatingTexts = [];
  game._aiTimer = 0;

  for (let i = 0; i < 3; i++) {
    game.player.units.push(createUnit('Miner', 'player', 0, 0));
    game.enemy.units.push(createUnit('Miner', 'enemy', 0, 0));
  }

  document.getElementById('shop-panel').classList.remove('hidden');
  updateShop();
  updateHUD();
  updateArmyPreview();
  startPrep();
}
