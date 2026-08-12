import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['js/__tests__/**/*.test.js'],
    setupFiles: ['js/__tests__/setup.js'],
  },
})
