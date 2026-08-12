import { describe, it, expect, beforeEach } from 'vitest'
import { createGameState } from './setup.js'

describe('updateEconomy', () => {
  let state

  beforeEach(() => {
    state = createGameState({ phase: 'prep' })
  })

  it('generates 3 gold per second per miner in prep phase', () => {
    state.player.units.push(createUnit('Miner', 'player', 0, 0))
    updateEconomy(1, state)
    expect(state.player.gold).toBe(403)
  })

  it('generates income from multiple miners', () => {
    for (let i = 0; i < 3; i++) state.player.units.push(createUnit('Miner', 'player', 0, 0))
    updateEconomy(1, state)
    expect(state.player.gold).toBe(409)
  })

  it('reduced income during battle phase (30%)', () => {
    state.phase = 'battle'
    state.player.units.push(createUnit('Miner', 'player', 0, 0))
    updateEconomy(1, state)
    expect(state.player.gold).toBeCloseTo(400.9, 1)
  })

  it('dead miners do not generate income', () => {
    const miner = createUnit('Miner', 'player', 0, 0)
    miner.state = 'dead'
    state.player.units.push(miner)
    updateEconomy(1, state)
    expect(state.player.gold).toBe(400)
  })

  it('both teams independently earn income', () => {
    state.player.units.push(createUnit('Miner', 'player', 0, 0))
    state.enemy.units.push(createUnit('Miner', 'enemy', 0, 0))
    updateEconomy(1, state)
    expect(state.player.gold).toBe(403)
    expect(state.enemy.gold).toBe(203)
  })
})
