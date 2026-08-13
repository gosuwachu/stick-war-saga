import { aiUpdate } from './ai';
import { resizeCanvas, updateFormationPositions } from './canvas';
import { createGameState } from './config';
import { createUnit } from './factory';
import { setInputDims, setInputState } from './input.js';
import { resetPvPRound, spawnEnemyWave, startBattle } from './phases';
import { render } from './render';
import { buildShop, setShopDims, setShopState, updateArmyPreview, updateHUD, updateShop } from './shop';
import { checkBattleEnd, updateEconomy, updateParticles, updateProjectiles, updateUnits } from './simulation';

let state = createGameState();
let dims = resizeCanvas();
setShopState(state);
setShopDims(dims);
setInputState(state);
setInputDims(dims);

function update(dt: number): void {
  if (state.phase === 'idle' || state.phase === 'gameover') return;
  state.time += dt;

  updateEconomy(dt, state);
  updateUnits(dt, state, dims);
  updateProjectiles(dt, state);
  updateParticles(dt, state);

  if (state.phase === 'prep') {
    state._aiTimer = state._aiTimer || 0;
    aiUpdate(dt, state, dims);
    state.prepTimer -= dt;
    if (state.prepTimer <= 0) {
      startBattle(state);
    }
    updateShop(state);
    updateHUD(state);
  } else if (state.phase === 'battle') {
    state.battleTimer += dt;
    checkBattleEnd(state, dims);
    updateHUD(state);
  } else if (state.phase === 'transition') {
    state.transitionTimer -= dt;
    if (state.transitionTimer <= 0) {
      if (state.mode === 'pvp') {
        if (state.pvpRound > state.pvpMaxRounds) {
          document.getElementById('game-over-title')!.textContent = state.pvpScore.p1 > state.pvpScore.p2 ? 'Player 1 Wins the Match!' : 'Player 2 Wins the Match!';
          document.getElementById('game-over-sub')!.textContent = `Final Score: ${state.pvpScore.p1} - ${state.pvpScore.p2}`;
          document.getElementById('final-wave')!.textContent = '';
          state.phase = 'gameover';
          document.getElementById('game-over')!.classList.add('show');
        } else {
          resetPvPRound(state, dims);
        }
      } else {
        if (state.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length === 0) {
          state.phase = 'gameover';
          document.getElementById('game-over-title')!.textContent = 'Game Over';
          document.getElementById('game-over-sub')!.textContent = 'You were overwhelmed on';
          document.getElementById('final-wave')!.textContent = `Wave ${state.wave}`;
          document.getElementById('game-over')!.classList.add('show');
        } else {
          state.wave++;
          state.enemy.units = state.enemy.units.filter(u => u.state !== 'dead' && u.state !== 'dying');
          state.player.units = state.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying');
          state.player.units.forEach(u => { u.hp = u.maxHp; u.state = 'idle'; u.target = null; });
          document.getElementById('shop-panel')!.classList.remove('hidden');
          spawnEnemyWave(state, dims);
        }
      }
    }
  }
}

function gameLoop(timestamp: number): void {
  if (!state._lastTime) state._lastTime = timestamp;
  const dt = Math.min((timestamp - state._lastTime) / 1000, 0.05);
  state._lastTime = timestamp;

  update(dt);
  render(state, dims);
  requestAnimationFrame(gameLoop);
}

function startGame(mode: 'ai' | 'pvp'): void {
  state = createGameState();
  dims = resizeCanvas();
  setShopState(state);
  setShopDims(dims);
  setInputState(state);
  setInputDims(dims);

  document.getElementById('mode-select')!.style.display = 'none';
  document.getElementById('game-over')!.classList.remove('show');
  state.mode = mode;
  state.phase = 'prep';
  state.player.gold = 400;
  state.enemy.gold = 200;

  for (let i = 0; i < 3; i++) {
    state.player.units.push(createUnit('Miner', 'player', 0, 0));
  }

  document.getElementById('shop-panel')!.classList.remove('hidden');
  spawnEnemyWave(state, dims);
  state.pvpArmySnapshot.player = structuredClone(state.player.units);
  state.pvpArmySnapshot.enemy = structuredClone(state.enemy.units);
  updateShop(state);
  updateHUD(state);
  updateArmyPreview(state);
}

buildShop();
requestAnimationFrame(gameLoop);

window.addEventListener('resize', () => {
  dims = resizeCanvas();
  setShopDims(dims);
  setInputDims(dims);
  updateFormationPositions(state, dims);
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-ai')!.addEventListener('click', () => startGame('ai'));
  document.getElementById('btn-pvp')!.addEventListener('click', () => startGame('pvp'));
  document.getElementById('btn-play-again')!.addEventListener('click', () => startGame(state.mode));
});
