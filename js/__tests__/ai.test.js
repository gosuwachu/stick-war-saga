import { describe, it, expect, beforeEach } from 'vitest'
import { createGameState } from './setup.js'

describe('aiBuyUnit', () => {
  let state

  beforeEach(() => {
    state = createGameState()
    state.enemy.gold = 500
  })

  it('buys an affordable unit and deducts gold', () => {
    const goldBefore = state.enemy.gold
    aiBuyUnit(state)
    expect(state.enemy.gold).toBeLessThan(goldBefore)
    expect(state.enemy.units.length).toBeGreaterThan(0)
  })

  it('never buys a Miner type', () => {
    for (let i = 0; i < 10; i++) {
      aiBuyUnit(state)
    }
    state.enemy.units.forEach(u => expect(u.type).not.toBe('Miner'))
  })

  it('does nothing when no units are affordable', () => {
    state.enemy.gold = 10
    aiBuyUnit(state)
    expect(state.enemy.units).toHaveLength(0)
  })

  it('can buy higher-cost units with sufficient gold', () => {
    state.enemy.gold = 500
    aiBuyUnit(state)
    const bought = state.enemy.units[0]
    expect(UNIT_TYPES[bought.type].cost).toBeLessThanOrEqual(500)
  })
})
