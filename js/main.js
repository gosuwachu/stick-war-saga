// ====================================================================
//  CANVAS SETUP
// ====================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W, H, GROUND_Y;

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  W = canvas.width;
  H = canvas.height;
  GROUND_Y = H - 60;
}
resizeCanvas();

const PLAYER_ZONE  = { x1: 0, x2: W * 0.32 };
const ENEMY_ZONE   = { x1: W * 0.68, x2: W };
const BATTLE_ZONE  = { x1: W * 0.25, x2: W * 0.75 };
const NO_MANS_LAND = { x1: W * 0.30, x2: W * 0.70 };

// ====================================================================
//  FORMATION POSITIONS
// ====================================================================
function updateFormationPositions(state, canvasW, groundY) {
  state = state || game;
  canvasW = canvasW || W;
  groundY = groundY || GROUND_Y;
  const py = groundY - 10;
  let midx = 0, sidx = 0;
  state.player.units.forEach(u => {
    if (u.state === 'dead' || u.state === 'dying') return;
    if (u.isMiner) {
      u.formationX = canvasW * 0.02 + midx * 18;
      u.formationY = py + 8;
      midx++;
    } else {
      u.formationX = canvasW * 0.08 + Math.floor(sidx / 5) * 28 + (sidx % 5) * 20;
      u.formationY = py - Math.floor(sidx / 5) * 4;
      sidx++;
    }
  });
  let emidx = 0, esidx = 0;
  state.enemy.units.forEach(u => {
    if (u.state === 'dead' || u.state === 'dying') return;
    if (u.isMiner) {
      u.formationX = canvasW * 0.96 - emidx * 18;
      u.formationY = py + 8;
      emidx++;
    } else {
      u.formationX = canvasW * 0.88 - Math.floor(esidx / 5) * 28 - (esidx % 5) * 20;
      u.formationY = py - Math.floor(esidx / 5) * 4;
      esidx++;
    }
  });
}

// ====================================================================
//  GAME LOOP
// ====================================================================
function update(dt) {
  if (game.phase === 'idle' || game.phase === 'gameover') return;
  game.time += dt;

  updateEconomy(dt);
  updateUnits(dt);
  updateProjectiles(dt);
  updateParticles(dt);

  if (game.phase === 'prep') {
    game._aiTimer = game._aiTimer || 0;
    aiUpdate(dt);
    game.prepTimer -= dt;
    if (game.prepTimer <= 0) {
      startBattle();
    }
    updateShop();
    updateHUD();
  } else if (game.phase === 'battle') {
    game.battleTimer += dt;
    if (checkBattleEnd()) {
      // transition started
    }
    updateHUD();
  } else if (game.phase === 'transition') {
    game.transitionTimer -= dt;
    if (game.transitionTimer <= 0) {
      if (game.mode === 'pvp') {
        if (game.pvpRound > game.pvpMaxRounds) {
          document.getElementById('game-over-title').textContent = game.pvpScore.p1 > game.pvpScore.p2 ? 'Player 1 Wins the Match!' : 'Player 2 Wins the Match!';
          document.getElementById('game-over-sub').textContent = 'Final Score: ' + game.pvpScore.p1 + ' - ' + game.pvpScore.p2;
          document.getElementById('final-wave').textContent = '';
          game.phase = 'gameover';
          document.getElementById('game-over').classList.add('show');
        } else {
          resetPvPRound();
        }
      } else {
        if (game.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length === 0) {
          game.phase = 'gameover';
          document.getElementById('game-over-title').textContent = 'Game Over';
          document.getElementById('game-over-sub').textContent = 'You were overwhelmed on';
          document.getElementById('final-wave').textContent = 'Wave ' + game.wave;
          document.getElementById('game-over').classList.add('show');
        } else {
          game.wave++;
          game.enemy.units = game.enemy.units.filter(u => u.state !== 'dead' && u.state !== 'dying');
          game.player.units = game.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying');
          game.player.units.forEach(u => { u.hp = u.maxHp; u.state = 'idle'; u.target = null; });
          document.getElementById('shop-panel').classList.remove('hidden');
          spawnEnemyWave();
        }
      }
    }
  }
}

function gameLoop(timestamp) {
  if (!game._lastTime) game._lastTime = timestamp;
  const dt = Math.min((timestamp - game._lastTime) / 1000, 0.05);
  game._lastTime = timestamp;

  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

// ====================================================================
//  START GAME
// ====================================================================
function startGame(mode) {
  document.getElementById('mode-select').style.display = 'none';
  document.getElementById('game-over').classList.remove('show');
  game.mode = mode;
  game.wave = 1;
  game.phase = 'prep';
  game.player.gold = 400;
  game.player.income = 0;
  game.player.units = [];
  game.enemy.gold = 200;
  game.enemy.income = 0;
  game.enemy.units = [];
  game.projectiles = [];
  game.particles = [];
  game.floatingTexts = [];
  game._aiTimer = 0;
  game.battleTimer = 0;
  game.transitionTimer = 0;
  game.pvpRound = 1;
  game.pvpScore = { p1: 0, p2: 0 };

  for (let i = 0; i < 3; i++) {
    game.player.units.push(createUnit('Miner', 'player', 0, 0));
  }

  document.getElementById('shop-panel').classList.remove('hidden');
  spawnEnemyWave();
  updateShop();
  updateHUD();
  updateArmyPreview();
}

// ====================================================================
//  INIT
// ====================================================================
buildShop();
requestAnimationFrame(gameLoop);

// ====================================================================
//  RESIZE HANDLER
// ====================================================================
window.addEventListener('resize', () => {
  resizeCanvas();
  updateFormationPositions();
});
