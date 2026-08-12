import { describe, it, expect, beforeEach } from 'vitest'
import { createGameState } from './setup.js'

describe('buyUnit', () => {
  let state

  beforeEach(() => {
    state = createGameState({ phase: 'prep' })
    state.player.gold = 400
    state.enemy.gold = 400
  })

  it('deducts gold from the correct team (player)', () => {
    buyUnit('Swordsman', 'player', state)
    expect(state.player.gold).toBe(300)
    expect(state.player.units).toHaveLength(1)
  })

  it('deducts gold from the correct team (enemy)', () => {
    buyUnit('Archer', 'enemy', state)
    expect(state.enemy.gold).toBe(260)
    expect(state.enemy.units).toHaveLength(1)
  })

  it('does nothing when phase is not prep', () => {
    state.phase = 'battle'
    buyUnit('Swordsman', 'player', state)
    expect(state.player.gold).toBe(400)
    expect(state.player.units).toHaveLength(0)
  })

  it('does nothing when player has insufficient gold', () => {
    state.player.gold = 50
    buyUnit('Swordsman', 'player', state)
    expect(state.player.gold).toBe(50)
  })

  it('adds unit to the correct array (player)', () => {
    buyUnit('Miner', 'player', state)
    expect(state.player.units[0].type).toBe('Miner')
    expect(state.player.units[0].team).toBe('player')
  })

  it('adds unit to the correct array (enemy)', () => {
    buyUnit('Giant', 'enemy', state)
    expect(state.enemy.units[0].type).toBe('Giant')
    expect(state.enemy.units[0].team).toBe('enemy')
  })
})
