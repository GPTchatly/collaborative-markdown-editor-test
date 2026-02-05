import type { Operation } from './operations'

export interface DocumentSnapshot {
  text: string
  revision: number
}

export interface DocumentOperation {
  op: Operation
  clientId: string
  revision: number
  timestamp: number
}
