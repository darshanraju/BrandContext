import { vi } from 'vitest'

Object.defineProperty(globalThis, 'chrome', {
  value: {
    storage: {
      sync: {
        get: vi.fn(async () => ({})),
        set: vi.fn(async () => {}),
      },
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    runtime: {
      onInstalled: { addListener: vi.fn() },
      openOptionsPage: vi.fn(),
    },
    tabs: {
      query: vi.fn(async () => [{ url: 'https://dream.ai/canvas' }]),
      create: vi.fn(),
    },
  },
  writable: true,
  configurable: true,
})
