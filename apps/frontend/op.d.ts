/// <reference types="@openpanel/web" />

declare global {
  interface Window {
    op: {
      q?: string[][]
      (...args: [
        'init' | 'track' | 'identify' | 'setGlobalProperties' | 'increment' | 'decrement' | 'clear',
        ...any[],
      ]): void
    }
  }
}
