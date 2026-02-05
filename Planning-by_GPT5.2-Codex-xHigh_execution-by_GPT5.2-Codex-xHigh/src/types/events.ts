import type { Operation } from './operations'

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'syncing'

export interface ConnectedEvent {
  type: 'connected'
  revision: number
  text: string
}

export interface UpdateEvent {
  type: 'update'
  op: Operation
  revision: number
  sourceClientId: string
}

export interface ResyncEvent {
  type: 'resync'
  revision: number
  text: string
}

export type SSEEvent = ConnectedEvent | UpdateEvent | ResyncEvent
