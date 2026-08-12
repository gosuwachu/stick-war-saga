import { aiUpdate } from './ai';
import { game } from './config';
import { createUnit } from './factory';
import { resetPvPRound, spawnEnemyWave, startBattle } from './phases';
import { render } from './render';
import { buildShop, updateArmyPreview, updateHUD, updateShop } from './shop';
import { checkBattleEnd, updateEconomy, updateParticles, updateProjectiles, updateUnits } from './simulation';
import './input.js';
import { resizeCanvas, updateFormationPositions } from './canvas';

resizeCanvas();

function update(dt: number): void {
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
    checkBattleEnd();
    updateHUD();
  } else if (game.phase === 'transition') {
    game.transitionTimer -= dt;
    if (game.transitionTimer <= 0) {
      if (game.mode === 'pvp') {
        if (game.pvpRound > game.pvpMaxRounds) {
          document.getElementById('game-over-title')!.textContent = game.pvpScore.p1 > game.pvpScore.p2 ? 'Player 1 Wins the Match!' : 'Player 2 Wins the Match!';
          document.getElementById('game-over-sub')!.textContent = `Final Score: ${game.pvpScore.p1} - ${game.pvpScore.p2}`;
          document.getElementById('final-wave')!.textContent = '';
          game.phase = 'gameover';
          document.getElementById('game-over')!.classList.add('show');
        } else {
          resetPvPRound();
        }
      } else {
        if (game.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length === 0) {
          game.phase = 'gameover';
          document.getElementById('game-over-title')!.textContent = 'Game Over';
          document.getElementById('game-over-sub')!.textContent = 'You were overwhelmed on';
          document.getElementById('final-wave')!.textContent = `Wave ${game.wave}`;
          document.getElementById('game-over')!.classList.add('show');
        } else {
          game.wave++;
          game.enemy.units = game.enemy.units.filter(u => u.state !== 'dead' && u.state !== 'dying');
          game.player.units = game.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying');
          game.player.units.forEach(u => { u.hp = u.maxHp; u.state = 'idle'; u.target = null; });
          document.getElementById('shop-panel')!.classList.remove('hidden');
          spawnEnemyWave();
        }
      }
    }
  }
}

function gameLoop(timestamp: number): void {
  if (!game._lastTime) game._lastTime = timestamp;
  const dt = Math.min((timestamp - game._lastTime) / 1000, 0.05);
  game._lastTime = timestamp;

  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

function startGame(mode: 'ai' | 'pvp'): void {
  document.getElementById('mode-select')!.style.display = 'none';
  document.getElementById('game-over')!.classList.remove('show');
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

  document.getElementById('shop-panel')!.classList.remove('hidden');
  spawnEnemyWave();
  updateShop();
  updateHUD();
  updateArmyPreview();
}

declare global {
  interface Window {
    startGame: typeof startGame;
  }
}

window.startGame = startGame;

buildShop();
requestAnimationFrame(gameLoop);

window.addEventListener('resize', () => {
  resizeCanvas();
  updateFormationPositions();
});
