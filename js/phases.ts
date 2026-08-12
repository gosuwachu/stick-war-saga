import { updateFormationPositions } from './canvas';
import { game, } from './config';
import { createUnit } from './factory';
import { updateArmyPreview, updateHUD, updateShop } from './shop';
import type { GameState } from './types';

export function startPrep(): void {
  game.phase = 'prep';
  game.prepTimer = game.prepTime;

  game.player.units.forEach(u => { u.state = 'idle'; u.target = null; });
  game.enemy.units.forEach(u => { u.state = 'idle'; u.target = null; });
  updateFormationPositions();
  game.player.units.forEach(u => { u.x = u.formationX; u.y = u.formationY; });
  game.enemy.units.forEach(u => { u.x = u.formationX; u.y = u.formationY; });

  game.projectiles = [];
  if (game.mode === 'pvp') {
    showBanner(`ROUND ${game.pvpRound}`, `BUILD YOUR ARMY  |  ${game.pvpScore.p1}-${game.pvpScore.p2}`, '#64b5f6');
  } else {
    showBanner('PREPARE', `Wave ${game.wave}  |  Buy your army!`, '#64b5f6');
  }
  updateShop();
  updateHUD();
}

export function startBattle(): void {
  game.phase = 'battle';
  game.battleTimer = 0;
  game.player.units.forEach(u => { if (!u.isMiner) u.state = 'marching'; });
  game.enemy.units.forEach(u => { if (!u.isMiner) u.state = 'marching'; });
  showBanner('BATTLE', 'Fight!', '#ff8a80');
  document.getElementById('shop-panel')!.classList.add('hidden');
  updateHUD();
}

export function endBattle(winner: string, state?: GameState): void {
  state = state || game;
  state.phase = 'transition';
  state.transitionTimer = 3;
  if (state.mode === 'pvp') {
    if (winner === 'player') state.pvpScore.p1++;
    else state.pvpScore.p2++;
    if (state.pvpRound >= state.pvpMaxRounds) {
      const matchWinner = state.pvpScore.p1 > state.pvpScore.p2 ? 'Player 1' : 'Player 2';
      showBanner(`${matchWinner} WINS THE MATCH!`, `${state.pvpScore.p1} - ${state.pvpScore.p2}`, '#ffd700');
    } else {
      showBanner(`ROUND ${state.pvpRound} COMPLETE`, `Player ${winner === 'player' ? '1' : '2'} wins  (${state.pvpScore.p1}-${state.pvpScore.p2})`, '#64b5f6');
    }
    state.pvpRound++;
  } else {
    if (winner === 'player') {
      const bonus = 80 + state.wave * 20;
      state.player.gold += bonus;
      state.player.units.forEach(u => { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.3); });
      showBanner('VICTORY', `Wave ${state.wave} cleared! +${bonus} gold`, '#81c784');
    } else {
      showBanner('DEFEAT', 'Your army has fallen...', '#ff8a80');
    }
  }
  updateHUD();
}

export function showBanner(title: string, sub: string, color: string): void {
  const el = document.getElementById('banner')!;
  document.getElementById('banner-title')!.textContent = title;
  (document.getElementById('banner-title')!).style.color = color;
  document.getElementById('banner-sub')!.textContent = sub;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

export function spawnEnemyWave(state?: GameState, waveOverride?: number): void {
  state = state || game;
  if (state.mode === 'pvp') {
    state.enemy.gold = 400;
    state.enemy.income = 0;
    state.enemy.units = [];
    for (let i = 0; i < 3; i++) {
      state.enemy.units.push(createUnit('Miner', 'enemy', 0, 0));
    }
  } else {
    const wave = waveOverride !== undefined ? waveOverride : state.wave;
    const startingGold = 150 + wave * 80;
    state.enemy.gold = startingGold;
    state.enemy.income = 0;
    state.enemy.units = [];
    const minerCount = Math.min(2 + Math.floor(wave / 2), 8);
    for (let i = 0; i < minerCount; i++) {
      state.enemy.units.push(createUnit('Miner', 'enemy', 0, 0));
    }
  }
  updateHUD();
  startPrep();
}

export function resetPvPRound(): void {
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

  document.getElementById('shop-panel')!.classList.remove('hidden');
  updateShop();
  updateHUD();
  updateArmyPreview();
  startPrep();
}
