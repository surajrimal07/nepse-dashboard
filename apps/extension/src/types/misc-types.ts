export interface stateResult {
  success: boolean
  message: string
  data?: any
}

export type track = 'track' | 'identify'
export type countType = 'activation' | 'tms' | 'meroshare'

export interface IncrementPayload {
  profileId: string
  property: string
  value?: number
}

export interface UpdateType {
  updateAvailable: boolean
  updateDetails: string | null
}

export interface StackError {
  message: string
  stack: string | undefined
  userAgent: string
  timestamp: string
  version: string
}
