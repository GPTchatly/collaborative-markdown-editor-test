import type { Operation } from '@/types/operations'

export interface OperationHistoryEntry {
  op: Operation
  revision: number
  clientId: string
  timestamp: number
}

export interface DocumentState {
  text: string
  revision: number
  history: OperationHistoryEntry[]
}
