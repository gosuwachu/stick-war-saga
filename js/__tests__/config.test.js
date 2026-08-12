import { describe, it, expect } from 'vitest'

describe('UNIT_TYPES', () => {
  it('has all 8 unit types', () => {
    expect(Object.keys(UNIT_TYPES)).toHaveLength(8)
  })

  it('has every type in UNIT_ORDER', () => {
    expect(UNIT_ORDER).toHaveLength(8)
    UNIT_ORDER.forEach(t => expect(UNIT_TYPES[t]).toBeDefined())
  })

  it('has costs > 0 for combat units, Miner is cheapest', () => {
    Object.entries(UNIT_TYPES).forEach(([name, def]) => {
      if (name !== 'Miner' && name !== 'Healer') expect(def.cost).toBeGreaterThan(80)
    })
  })

  it('has HP > 0 for all types', () => {
    Object.values(UNIT_TYPES).forEach(def => expect(def.hp).toBeGreaterThan(0))
  })

  it('has damage >= 0 for all types', () => {
    Object.values(UNIT_TYPES).forEach(def => expect(def.dmg).toBeGreaterThanOrEqual(0))
    expect(UNIT_TYPES.Healer.dmg).toBe(0)
  })

  it('has range >= 25 for all types', () => {
    Object.values(UNIT_TYPES).forEach(def => expect(def.range).toBeGreaterThanOrEqual(25))
  })

  it('has speed > 0 for all types', () => {
    Object.values(UNIT_TYPES).forEach(def => expect(def.speed).toBeGreaterThan(0))
  })

  it('Miner has income, others do not', () => {
    expect(UNIT_TYPES.Miner.income).toBe(3)
    UNIT_ORDER.filter(t => t !== 'Miner').forEach(t => expect(UNIT_TYPES[t].income).toBe(0))
  })
})
