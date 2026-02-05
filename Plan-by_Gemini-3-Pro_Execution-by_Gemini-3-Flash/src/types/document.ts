import type { Operation } from './operations'

export interface Document {
  text: string
  revision: number
}

export interface HistoryItem {
  op: Operation
  clientId: string
  timestamp: number
  revision: number
}
