import { describe, it, expect, beforeEach } from 'vitest'
import { createGameState } from './setup'
import { createUnit } from '../factory'
import { checkBattleEnd } from '../simulation'

describe('checkBattleEnd', () => {
  let state: ReturnType<typeof createGameState>

  beforeEach(() => {
    state = createGameState({ phase: 'battle' })
  })

  it('returns false when both sides have living units', () => {
    state.player.units.push(createUnit('Swordsman', 'player', 10, 10))
    state.enemy.units.push(createUnit('Swordsman', 'enemy', 100, 10))
    expect(checkBattleEnd(state)).toBe(false)
  })

  it('returns true and sets winner to enemy when all player units are dead', () => {
    const u = createUnit('Swordsman', 'player', 10, 10)
    u.state = 'dead'
    state.player.units.push(u)
    state.enemy.units.push(createUnit('Swordsman', 'enemy', 100, 10))
    expect(checkBattleEnd(state)).toBe(true)
  })

  it('returns true when all enemy units are dead', () => {
    state.player.units.push(createUnit('Swordsman', 'player', 10, 10))
    const u = createUnit('Swordsman', 'enemy', 100, 10)
    u.state = 'dead'
    state.enemy.units.push(u)
    expect(checkBattleEnd(state)).toBe(true)
  })

  it('returns true when both sides have zero units', () => {
    expect(checkBattleEnd(state)).toBe(true)
  })

  it('does nothing when phase is not battle', () => {
    state.phase = 'prep'
    expect(checkBattleEnd(state)).toBe(false)
  })

  it('activates miners to march when no combat units remain', () => {
    state.player.units.push(createUnit('Miner', 'player', 10, 10))
    state.enemy.units.push(createUnit('Miner', 'enemy', 100, 10))
    checkBattleEnd(state)
    expect(state.player.units[0].state).toBe('marching')
    expect(state.enemy.units[0].state).toBe('marching')
  })
})
