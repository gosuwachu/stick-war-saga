import { describe, it, expect, beforeEach } from 'vitest'
import { createGameState } from './setup'
import { createUnit } from '../factory'
import { endBattle, spawnEnemyWave } from '../phases'

describe('endBattle (PvP)', () => {
  let state: ReturnType<typeof createGameState>

  beforeEach(() => {
    state = createGameState({ mode: 'pvp' })
    state.pvpRound = 1
    state.pvpScore = { p1: 0, p2: 0 }
  })

  it('increments player 1 score when player wins', () => {
    endBattle('player', state)
    expect(state.pvpScore.p1).toBe(1)
    expect(state.pvpScore.p2).toBe(0)
  })

  it('increments player 2 score when enemy wins', () => {
    endBattle('enemy', state)
    expect(state.pvpScore.p1).toBe(0)
    expect(state.pvpScore.p2).toBe(1)
  })

  it('advances pvpRound after each battle', () => {
    endBattle('player', state)
    expect(state.pvpRound).toBe(2)
    endBattle('player', state)
    expect(state.pvpRound).toBe(3)
  })

  it('sets phase to transition', () => {
    endBattle('player', state)
    expect(state.phase).toBe('transition')
  })
})

describe('endBattle (AI mode)', () => {
  let state: ReturnType<typeof createGameState>

  beforeEach(() => {
    state = createGameState({ mode: 'ai', wave: 1 })
    state.player.gold = 400
    state.player.units.push(createUnit('Swordsman', 'player', 10, 10))
  })

  it('awards bonus gold on victory', () => {
    endBattle('player', state)
    expect(state.player.gold).toBeGreaterThan(400)
  })

  it('bonus scales with wave number', () => {
    state.wave = 5
    const u = createUnit('Swordsman', 'player', 10, 10)
    u.hp = 50
    state.player.units.push(u)
    endBattle('player', state)
    expect(state.player.gold).toBe(580)
  })

  it('partially heals surviving units on AI victory', () => {
    state.player.units[0].hp = 50
    endBattle('player', state)
    expect(state.player.units[0].hp).toBeGreaterThan(50)
  })
})

describe('spawnEnemyWave', () => {
  let state: ReturnType<typeof createGameState>

  beforeEach(() => {
    state = createGameState({ mode: 'ai', wave: 1 })
  })

  it('gives enemy the correct starting gold for wave 1', () => {
    spawnEnemyWave(state, 1)
    expect(state.enemy.gold).toBe(230)
    expect(state.enemy.units.length).toBeGreaterThanOrEqual(2)
  })

  it('scales enemy gold with wave number', () => {
    spawnEnemyWave(state, 5)
    expect(state.enemy.gold).toBe(550)
  })

  it('increases enemy miner count with wave', () => {
    spawnEnemyWave(state, 1)
    const miners1 = state.enemy.units.filter(u => u.isMiner).length
    state.enemy.units = []
    spawnEnemyWave(state, 7)
    const miners2 = state.enemy.units.filter(u => u.isMiner).length
    expect(miners2).toBeGreaterThan(miners1)
  })
})
