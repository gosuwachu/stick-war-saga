import { beforeEach, } from 'vitest'
import { createGameState } from '../config.js'
import type { CanvasDims } from '../types.js'

export { createGameState }

export const testDims: CanvasDims = {
  width: 1000,
  height: 600,
  groundY: 540,
  playerZone: { x1: 0, x2: 320 },
  enemyZone: { x1: 680, x2: 1000 },
  battleZone: { x1: 250, x2: 750 },
  noMansLand: { x1: 300, x2: 700 },
};

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
