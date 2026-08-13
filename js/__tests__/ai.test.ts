import { beforeEach, describe, expect, it } from 'vitest'
import { aiBuyUnit } from '../ai'
import { UNIT_TYPES } from '../config'
import { createGameState, testDims } from './setup'

describe('aiBuyUnit', () => {
  let state: ReturnType<typeof createGameState>

  beforeEach(() => {
    state = createGameState()
    state.enemy.gold = 500
  })

  it('buys an affordable unit and deducts gold', () => {
    const goldBefore = state.enemy.gold
    aiBuyUnit(state, testDims)
    expect(state.enemy.gold).toBeLessThan(goldBefore)
    expect(state.enemy.units.length).toBeGreaterThan(0)
  })

  it('can buy Miner type but caps at 6', () => {
    for (let i = 0; i < 20; i++) {
      aiBuyUnit(state, testDims)
    }
    const miners = state.enemy.units.filter(u => u.type === 'Miner')
    expect(miners.length).toBeLessThanOrEqual(6)
  })

  it('does nothing when no units are affordable', () => {
    state.enemy.gold = 10
    aiBuyUnit(state, testDims)
    expect(state.enemy.units).toHaveLength(0)
  })

  it('can buy higher-cost units with sufficient gold', () => {
    state.enemy.gold = 500
    aiBuyUnit(state, testDims)
    const bought = state.enemy.units[0]
    expect(UNIT_TYPES[bought.type].cost).toBeLessThanOrEqual(500)
  })
})
