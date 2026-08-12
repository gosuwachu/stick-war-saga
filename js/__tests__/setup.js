// ====================================================================
//  Test setup — registers all globals that source functions depend on
// ====================================================================

import { vi, beforeEach } from 'vitest'

// ---- UNIT_TYPES (from config.js) ----
globalThis.UNIT_TYPES = {
  Miner:    { cost: 80,  hp: 40,  dmg: 4,  range: 25, speed: 50, atkCd: 1.0, income: 3, label: 'Miner',    desc: '+3g/s income' },
  Swordsman:{ cost: 100, hp: 100, dmg: 14, range: 30, speed: 55, atkCd: 0.8, income: 0, label: 'Swordsman', desc: 'Balanced melee' },
  Archer:   { cost: 140, hp: 55,  dmg: 10, range: 220, speed: 45, atkCd: 1.0, income: 0, label: 'Archer',   desc: 'Ranged attacker' },
  Spearman: { cost: 120, hp: 120, dmg: 12, range: 40, speed: 50, atkCd: 0.9, income: 0, label: 'Spearman',  desc: 'Tough melee' },
  Knight:   { cost: 200, hp: 140, dmg: 20, range: 30, speed: 75, atkCd: 0.7, income: 0, label: 'Knight',    desc: 'Fast & strong' },
  Mage:     { cost: 240, hp: 45,  dmg: 22, range: 200, speed: 40, atkCd: 1.2, income: 0, label: 'Mage',      desc: 'AoE damage' },
  Giant:    { cost: 400, hp: 400, dmg: 35, range: 40, speed: 30, atkCd: 1.0, income: 0, label: 'Giant',     desc: 'Massive & tough' },
  Healer:   { cost: 180, hp: 60,  dmg: 0,  range: 160, speed: 45, atkCd: 2.0, income: 0, label: 'Healer',    desc: 'Heals allies' },
}

globalThis.UNIT_ORDER = ['Miner','Swordsman','Archer','Spearman','Knight','Mage','Giant','Healer']

globalThis.P1_KEYS = { '1':'Miner', 'q':'Swordsman', 'a':'Archer', 'z':'Spearman', 'x':'Knight', 's':'Mage', 'w':'Giant', '2':'Healer' }
globalThis.P2_KEYS = { '=':'Miner', '[':'Swordsman', ';':'Archer', '.':'Spearman', ',':'Knight', 'l':'Mage', 'p':'Giant', '-':'Healer' }

globalThis.KEY_NAMES = { '1':'1','q':'Q','a':'A','z':'Z','x':'X','s':'S','w':'W','2':'2', '=':'=', '[':'[', ';':';', '.':'.', ',':',', 'l':'L', 'p':'P', '-':'-' }

// ---- Utility functions (from config.js) ----
globalThis.lerp = (a, b, t) => a + (b - a) * t
globalThis.dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
globalThis.rand = (min, max) => Math.random() * (max - min) + min
globalThis.randInt = (min, max) => Math.floor(rand(min, max + 1))
globalThis.clamp = (v, min, max) => Math.max(min, Math.min(max, v))

// ---- Default game object ----
globalThis.game = {
  mode: 'ai', phase: 'idle', wave: 1, prepTime: 25, prepTimer: 25,
  battleTimer: 0, transitionTimer: 0, time: 0,
  player: { gold: 400, income: 0, units: [] },
  enemy:  { gold: 200, income: 0, units: [] },
  projectiles: [], particles: [], floatingTexts: [],
  pvpRound: 1, pvpMaxRounds: 5, pvpScore: { p1: 0, p2: 0 },
}

// ---- Canvas globals (from main.js) ----
globalThis.W = 1000
globalThis.H = 500
globalThis.GROUND_Y = 440

// ---- createUnit (from factory.js) ----
globalThis.createUnit = function createUnit(type, team, x, y) {
  const def = UNIT_TYPES[type]
  const isGiant = type === 'Giant'
  const scale = isGiant ? 1.8 : 1
  return {
    type, team, x, y,
    hp: def.hp, maxHp: def.hp, dmg: def.dmg,
    range: def.range, speed: def.speed, atkCd: def.atkCd,
    income: def.income, scale,
    state: 'idle', atkTimer: 0, target: null,
    dir: team === 'player' ? 1 : -1,
    wanderPhase: rand(0, Math.PI * 2),
    animTime: 0, deathTimer: 0, attackAnim: 0,
    isGiant, isHealer: type === 'Healer', isMiner: type === 'Miner',
    isRanged: type === 'Archer' || type === 'Mage',
    formationX: x, formationY: y,
    killCount: 0, splash: type === 'Mage',
    healPower: type === 'Healer' ? 8 : 0,
  }
}

// ---- updateEconomy (from simulation.js) ----
globalThis.updateEconomy = function updateEconomy(dt, state) {
  state = state || game
  let pIncome = 0
  state.player.units.forEach(u => { if (u.isMiner && u.state !== 'dead' && u.state !== 'dying') pIncome += u.income })
  let eIncome = 0
  state.enemy.units.forEach(u => { if (u.isMiner && u.state !== 'dead' && u.state !== 'dying') eIncome += u.income })
  state.player.income = pIncome
  state.enemy.income = eIncome
  if (state.phase === 'prep') {
    state.player.gold += pIncome * dt
    state.enemy.gold += eIncome * dt
  } else if (state.phase === 'battle') {
    state.player.gold += pIncome * dt * 0.3
    state.enemy.gold += eIncome * dt * 0.3
  }
}

// ---- checkBattleEnd (from simulation.js) ----
globalThis.checkBattleEnd = function checkBattleEnd(state) {
  state = state || game
  const pAlive = state.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying' && !u.isMiner).length
  const eAlive = state.enemy.units.filter(u => u.state !== 'dead' && u.state !== 'dying' && !u.isMiner).length
  const pAll = state.player.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length
  const eAll = state.enemy.units.filter(u => u.state !== 'dead' && u.state !== 'dying').length
  if (state.phase === 'battle') {
    if (pAll === 0) return true
    if (eAll === 0) return true
    if (pAlive === 0 && eAlive === 0 && pAll > 0 && eAll > 0) {
      state.player.units.forEach(u => { if (u.isMiner && u.state !== 'dead') u.state = 'marching' })
      state.enemy.units.forEach(u => { if (u.isMiner && u.state !== 'dead') u.state = 'marching' })
    }
  }
  return false
}

// ---- updateProjectiles (from simulation.js) ----
globalThis.spawnProjectile = function spawnProjectile(source, target, state) {
  state = state || game
  state.projectiles.push({
    x: source.x + source.dir * 10, y: source.y - 15,
    targetX: target.x, targetY: target.y - 10,
    speed: 300 + rand(0, 50), life: 2, source,
    type: source.type === 'Mage' ? 'magic' : 'arrow',
  })
}

globalThis.updateProjectiles = function updateProjectiles(dt, state) {
  state = state || game
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i]
    const dx = p.targetX - p.x
    const dy = p.targetY - p.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < 10 || p.life <= 0) { state.projectiles.splice(i, 1); continue }
    const move = p.speed * dt
    if (move >= d) { p.x = p.targetX; p.y = p.targetY; p.life = 0 }
    else { p.x += (dx / d) * move; p.y += (dy / d) * move }
    p.life -= dt
  }
}

// ---- Particles & effects (from simulation.js) ----
globalThis.spawnHitEffect = function spawnHitEffect(x, y, state) {
  state = state || game
  for (let i = 0; i < 5; i++) state.particles.push({ x, y, vx: rand(-40, 40), vy: rand(-60, -10), life: rand(0.2, 0.5), maxLife: 0.5, color: '#ff8a80', size: rand(2, 4) })
}

globalThis.spawnHealEffect = function spawnHealEffect(x, y, state) {
  state = state || game
  for (let i = 0; i < 4; i++) state.particles.push({ x, y, vx: rand(-20, 20), vy: rand(-40, -20), life: rand(0.3, 0.6), maxLife: 0.6, color: '#81c784', size: rand(2, 5) })
}

globalThis.spawnFloatingText = function spawnFloatingText(x, y, text, color, state) {
  state = state || game
  state.floatingTexts.push({ x, y, text, color, life: 1, maxLife: 1 })
}

globalThis.updateParticles = function updateParticles(dt, state) {
  state = state || game
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i]
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 100 * dt; p.life -= dt
    if (p.life <= 0) state.particles.splice(i, 1)
  }
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const f = state.floatingTexts[i]
    f.y -= 30 * dt; f.life -= dt
    if (f.life <= 0) state.floatingTexts.splice(i, 1)
  }
}

// ---- aiBuyUnit (from ai.js) ----
globalThis.aiBuyUnit = function aiBuyUnit(state, wave) {
  state = state || game
  wave = wave || state.wave
  const affordable = UNIT_ORDER.filter(t => t !== 'Miner' && UNIT_TYPES[t].cost <= state.enemy.gold)
  if (affordable.length === 0) return
  const counts = {}
  state.enemy.units.forEach(u => { counts[u.type] = (counts[u.type] || 0) + 1 })
  let weights = affordable.map(t => {
    let w = 1
    const count = counts[t] || 0
    if (count > 3) w *= 0.3
    if (count > 5) w *= 0.2
    if (count === 0) w *= 2
    if (t === 'Giant' && wave > 3) w *= 1.5
    if (t === 'Mage' && wave > 2) w *= 1.3
    if (t === 'Archer') w *= 1.2
    if (t === 'Knight' && wave > 2) w *= 1.4
    return w
  })
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * totalWeight
  let chosen = affordable[0]
  for (let i = 0; i < affordable.length; i++) { r -= weights[i]; if (r <= 0) { chosen = affordable[i]; break } }
  if (UNIT_TYPES[chosen].cost <= state.enemy.gold) {
    state.enemy.gold -= UNIT_TYPES[chosen].cost
    state.enemy.units.push(createUnit(chosen, 'enemy', W * 0.90 + rand(-15, 15), GROUND_Y - 10 + rand(-3, 3)))
  }
}

// ---- endBattle (from phases.js) ----
globalThis.endBattle = function endBattle(winner, state) {
  state = state || game
  state.phase = 'transition'
  state.transitionTimer = 3
  if (state.mode === 'pvp') {
    if (winner === 'player') state.pvpScore.p1++; else state.pvpScore.p2++
    state.pvpRound++
  } else {
    if (winner === 'player') {
      const bonus = 80 + state.wave * 20
      state.player.gold += bonus
      state.player.units.forEach(u => { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.3) })
    }
  }
}

// ---- spawnEnemyWave (from phases.js) ----
globalThis.spawnEnemyWave = function spawnEnemyWave(state, waveOverride) {
  state = state || game
  if (state.mode === 'pvp') {
    state.enemy.gold = 400
    state.enemy.units = []
    for (let i = 0; i < 3; i++) state.enemy.units.push(createUnit('Miner', 'enemy', 0, 0))
  } else {
    const wave = waveOverride !== undefined ? waveOverride : state.wave
    state.enemy.gold = 150 + wave * 80
    state.enemy.units = []
    const minerCount = Math.min(2 + Math.floor(wave / 2), 8)
    for (let i = 0; i < minerCount; i++) state.enemy.units.push(createUnit('Miner', 'enemy', 0, 0))
  }
}

// ---- buyUnit (from shop.js) ----
globalThis.buyUnit = function buyUnit(type, team, state) {
  state = state || game
  if (state.phase !== 'prep') return
  const def = UNIT_TYPES[type]
  const gold = team === 'player' ? state.player.gold : state.enemy.gold
  const units = team === 'player' ? state.player.units : state.enemy.units
  if (gold < def.cost) return
  if (team === 'player') state.player.gold -= def.cost
  else state.enemy.gold -= def.cost
  const u = createUnit(type, team, 0, 0)
  units.push(u)
}

// ---- updateFormationPositions (from main.js) ----
globalThis.updateFormationPositions = function updateFormationPositions(state, canvasW, groundY) {
  state = state || game
  canvasW = canvasW || W
  groundY = groundY || GROUND_Y
  const py = groundY - 10
  let midx = 0, sidx = 0
  state.player.units.forEach(u => {
    if (u.state === 'dead' || u.state === 'dying') return
    if (u.isMiner) {
      u.formationX = canvasW * 0.02 + midx * 18; u.formationY = py + 8; midx++
    } else {
      u.formationX = canvasW * 0.08 + Math.floor(sidx / 5) * 28 + (sidx % 5) * 20
      u.formationY = py - Math.floor(sidx / 5) * 4; sidx++
    }
  })
  let emidx = 0, esidx = 0
  state.enemy.units.forEach(u => {
    if (u.state === 'dead' || u.state === 'dying') return
    if (u.isMiner) {
      u.formationX = canvasW * 0.96 - emidx * 18; u.formationY = py + 8; emidx++
    } else {
      u.formationX = canvasW * 0.88 - Math.floor(esidx / 5) * 28 - (esidx % 5) * 20
      u.formationY = py - Math.floor(esidx / 5) * 4; esidx++
    }
  })
}

// ---- Helper: create a fresh game state for testing ----
export function createGameState(overrides = {}) {
  const state = {
    mode: 'ai', phase: 'prep', wave: 1,
    prepTime: 25, prepTimer: 25, battleTimer: 0, transitionTimer: 0, time: 0,
    player: { gold: 400, income: 0, units: [] },
    enemy:  { gold: 200, income: 0, units: [] },
    projectiles: [], particles: [], floatingTexts: [],
    pvpRound: 1, pvpMaxRounds: 5, pvpScore: { p1: 0, p2: 0 },
  }
  Object.assign(state, overrides)
  return state
}

// ---- Reset mocks before each test ----
beforeEach(() => {
  vi.restoreAllMocks()
})
