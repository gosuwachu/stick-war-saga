import { describe, it, expect, beforeEach } from 'vitest'
import { createGameState } from './setup'
import { createUnit } from '../factory'
import { updateFormationPositions, W, GROUND_Y } from '../canvas'

const CANVAS_W = 1000

describe('updateFormationPositions', () => {
  let state: ReturnType<typeof createGameState>

  beforeEach(() => {
    state = createGameState()
  })

  it('assigns non-NaN formationX and formationY to all units', () => {
    state.player.units.push(createUnit('Swordsman', 'player', 0, 0))
    state.player.units.push(createUnit('Archer', 'player', 0, 0))
    state.enemy.units.push(createUnit('Swordsman', 'enemy', 0, 0))
    updateFormationPositions(state, CANVAS_W, GROUND_Y)
    state.player.units.forEach(u => {
      expect(isNaN(u.formationX)).toBe(false)
      expect(isNaN(u.formationY)).toBe(false)
    })
    state.enemy.units.forEach(u => {
      expect(isNaN(u.formationX)).toBe(false)
      expect(isNaN(u.formationY)).toBe(false)
    })
  })

  it('places miners behind combat units (player side)', () => {
    state.player.units.push(createUnit('Miner', 'player', 0, 0))
    state.player.units.push(createUnit('Swordsman', 'player', 0, 0))
    updateFormationPositions(state, CANVAS_W, GROUND_Y)
    const miner = state.player.units[0]
    const sword = state.player.units[1]
    expect(miner.formationX).toBeLessThan(sword.formationX)
    expect(miner.formationY).toBeGreaterThan(sword.formationY)
  })

  it('places enemy units on the right side, mirrored from player', () => {
    state.player.units.push(createUnit('Swordsman', 'player', 0, 0))
    state.enemy.units.push(createUnit('Swordsman', 'enemy', 0, 0))
    updateFormationPositions(state, CANVAS_W, GROUND_Y)
    const p = state.player.units[0]
    const e = state.enemy.units[0]
    expect(p.formationX).toBeLessThan(CANVAS_W * 0.5)
    expect(e.formationX).toBeGreaterThan(CANVAS_W * 0.5)
  })

  it('positions multiple combat units in rows', () => {
    for (let i = 0; i < 6; i++) {
      state.player.units.push(createUnit('Swordsman', 'player', 0, 0))
    }
    updateFormationPositions(state, CANVAS_W, GROUND_Y)
    const row0 = state.player.units[4]
    const row1 = state.player.units[5]
    expect(row0.formationY).toBeGreaterThan(row1.formationY)
  })

  it('handles mix of miners and combat units', () => {
    state.player.units.push(createUnit('Miner', 'player', 0, 0))
    state.player.units.push(createUnit('Miner', 'player', 0, 0))
    state.player.units.push(createUnit('Swordsman', 'player', 0, 0))
    state.player.units.push(createUnit('Archer', 'player', 0, 0))
    updateFormationPositions(state, CANVAS_W, GROUND_Y)
    state.player.units.forEach(u => {
      expect(isNaN(u.formationX)).toBe(false)
      expect(isNaN(u.formationY)).toBe(false)
    })
    const miners = state.player.units.filter(u => u.isMiner)
    const fighters = state.player.units.filter(u => !u.isMiner)
    miners.forEach(m => expect(fighters[0].formationX).toBeGreaterThan(m.formationX))
  })
})
