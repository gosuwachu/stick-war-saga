import { beforeEach, } from 'vitest'
import type { GameState } from '../types.js'

export function createGameState(overrides: Partial<GameState> = {}): GameState {
  const state: GameState = {
    mode: 'ai', phase: 'idle', wave: 1,
    prepTime: 25, prepTimer: 25, battleTimer: 0, transitionTimer: 0, time: 0,
    player: { gold: 400, income: 0, units: [] },
    enemy:  { gold: 200, income: 0, units: [] },
    projectiles: [], particles: [], floatingTexts: [],
    pvpRound: 1, pvpMaxRounds: 5, pvpScore: { p1: 0, p2: 0 }, pvpArmySnapshot: { player: [], enemy: [] },
  }
  Object.assign(state, overrides)
  return state
}

function createMockElement(): any {
  return {
    className: '', dataset: {}, innerHTML: '', style: {},
    textContent: '',
    addEventListener: () => {},
    appendChild: () => {},
    querySelectorAll: () => [],
    querySelector: () => mockEl,
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
  }
}

const mockEl = createMockElement()

beforeEach(() => {
  if (typeof document === 'undefined') {
    globalThis.document = {
      getElementById: () => mockEl,
      createElement: () => createMockElement(),
    } as any
  }
})
