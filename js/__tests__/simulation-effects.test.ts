import { describe, it, expect, beforeEach } from 'vitest'
import { createGameState } from './setup'
import { spawnProjectile, updateProjectiles, spawnHitEffect, spawnHealEffect, spawnFloatingText, updateParticles } from '../simulation'

describe('projectiles', () => {
  let state: ReturnType<typeof createGameState>

  beforeEach(() => {
    state = createGameState()
  })

  it('spawnProjectile creates a projectile', () => {
    const source = { x: 100, y: 200, dir: 1, type: 'Archer' } as any
    const target = { x: 300, y: 200 } as any
    spawnProjectile(source, target, state)
    expect(state.projectiles).toHaveLength(1)
    expect(state.projectiles[0].type).toBe('arrow')
  })

  it('Mage projectiles are magic type', () => {
    const source = { x: 100, y: 200, dir: -1, type: 'Mage' } as any
    const target = { x: 50, y: 200 } as any
    spawnProjectile(source, target, state)
    expect(state.projectiles[0].type).toBe('magic')
  })

  it('updateProjectiles moves projectile toward target', () => {
    const source = { x: 100, y: 200, dir: 1, type: 'Archer' } as any
    const target = { x: 300, y: 200 } as any
    spawnProjectile(source, target, state)
    const p = state.projectiles[0]
    const startX = p.x
    updateProjectiles(0.016, state)
    expect(p.x).toBeGreaterThan(startX)
  })

  it('updateProjectiles removes projectiles that reach target', () => {
    const source = { x: 100, y: 200, dir: 1, type: 'Archer' } as any
    const target = { x: 110, y: 200 } as any
    spawnProjectile(source, target, state)
    updateProjectiles(1, state)
    expect(state.projectiles).toHaveLength(0)
  })
})

describe('particles & floating text', () => {
  let state: ReturnType<typeof createGameState>

  beforeEach(() => {
    state = createGameState()
  })

  it('spawnHitEffect creates 5 particles', () => {
    spawnHitEffect(100, 100, state)
    expect(state.particles).toHaveLength(5)
  })

  it('spawnHealEffect creates 4 particles', () => {
    spawnHealEffect(100, 100, state)
    expect(state.particles).toHaveLength(4)
  })

  it('spawnFloatingText creates a text entry', () => {
    spawnFloatingText(100, 100, '-14', '#ff8a80', state)
    expect(state.floatingTexts).toHaveLength(1)
    expect(state.floatingTexts[0].text).toBe('-14')
  })

  it('updateParticles removes particles with expired life', () => {
    state.particles.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0.001, maxLife: 0.5, color: '#fff', size: 2 })
    updateParticles(1, state)
    expect(state.particles).toHaveLength(0)
  })

  it('updateParticles removes floating texts with expired life', () => {
    state.floatingTexts.push({ x: 0, y: 0, text: 'test', color: '#fff', life: 0.001, maxLife: 1 })
    updateParticles(1, state)
    expect(state.floatingTexts).toHaveLength(0)
  })
})
