import type { Operation } from './operations'

export interface Document {
  text: string
  revision: number
}

export interface DocumentHistoryEntry {
  revision: number
  op: Operation
  clientId: string
  timestamp: number
}
