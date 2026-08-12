import { describe, it, expect } from 'vitest'
import { UNIT_TYPES, UNIT_ORDER } from '../config'
import { createUnit } from '../factory'

describe('createUnit', () => {
  it('creates a unit with correct properties', () => {
    const u = createUnit('Swordsman', 'player', 100, 200)
    expect(u.type).toBe('Swordsman')
    expect(u.team).toBe('player')
    expect(u.x).toBe(100)
    expect(u.y).toBe(200)
    expect(u.hp).toBe(100)
    expect(u.maxHp).toBe(100)
    expect(u.dmg).toBe(14)
    expect(u.dir).toBe(1)
    expect(u.state).toBe('idle')
    expect(u.formationX).toBe(100)
    expect(u.formationY).toBe(200)
  })

  it('creates enemy units with dir=-1', () => {
    const u = createUnit('Archer', 'enemy', 0, 0)
    expect(u.dir).toBe(-1)
  })

  it('sets isMiner only for Miner type', () => {
    expect(createUnit('Miner', 'player', 0, 0).isMiner).toBe(true)
    expect(createUnit('Swordsman', 'player', 0, 0).isMiner).toBe(false)
    expect(createUnit('Archer', 'player', 0, 0).isMiner).toBe(false)
  })

  it('sets isRanged for Archer and Mage', () => {
    expect(createUnit('Archer', 'player', 0, 0).isRanged).toBe(true)
    expect(createUnit('Mage', 'player', 0, 0).isRanged).toBe(true)
    expect(createUnit('Swordsman', 'player', 0, 0).isRanged).toBe(false)
  })

  it('sets isHealer only for Healer', () => {
    expect(createUnit('Healer', 'player', 0, 0).isHealer).toBe(true)
    expect(createUnit('Swordsman', 'player', 0, 0).isHealer).toBe(false)
  })

  it('sets isGiant only for Giant', () => {
    const g = createUnit('Giant', 'enemy', 0, 0)
    expect(g.isGiant).toBe(true)
    expect(g.scale).toBe(1.8)
    expect(createUnit('Swordsman', 'player', 0, 0).isGiant).toBe(false)
  })

  it('sets splash only for Mage', () => {
    expect(createUnit('Mage', 'player', 0, 0).splash).toBe(true)
    expect(createUnit('Archer', 'player', 0, 0).splash).toBe(false)
  })

  it('sets healPower only for Healer', () => {
    expect(createUnit('Healer', 'player', 0, 0).healPower).toBe(8)
    expect(createUnit('Swordsman', 'player', 0, 0).healPower).toBe(0)
  })

  it('creates all 8 unit types without error', () => {
    UNIT_ORDER.forEach(type => {
      const u = createUnit(type, 'player', 0, 0)
      expect(u.hp).toBeGreaterThan(0)
      expect(u.maxHp).toBeGreaterThan(0)
    })
  })

  it('each unit has unique wanderPhase', () => {
    const phases = UNIT_ORDER.map(type => createUnit(type, 'player', 0, 0).wanderPhase)
    expect(new Set(phases).size).toBeGreaterThan(1)
  })
})
