export type modeType = 'chart' | 'tms' | 'ai'

export const MODES: modeType[] = ['chart', 'tms', 'ai']

export function getNextMode(m: modeType) {
  const i = MODES.indexOf(m)
  return MODES[(i + 1) % MODES.length]
}

export interface searchAIResponse {
  message: string
  chatId?: string
}
