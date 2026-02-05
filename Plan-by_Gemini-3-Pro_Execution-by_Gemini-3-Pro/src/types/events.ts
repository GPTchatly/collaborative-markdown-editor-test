import type { Operation } from './operations'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'syncing'

export type SSEEvent =
  | {
      type: 'connected'
      revision: number
    }
  | {
      type: 'update'
      revision: number
      op: Operation
      sourceClientId: string
    }
  | {
      type: 'ack'
      revision: number
      clientId: string
    }
