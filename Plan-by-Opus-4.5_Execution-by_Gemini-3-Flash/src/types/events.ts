import type { Operation } from './operations'

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'syncing'

export interface ConnectedEvent {
  type: 'connected'
  revision: number
  clientId: string
}

export interface UpdateEvent {
  type: 'update'
  op: Operation
  sourceClientId: string
  revision: number
}

export interface ErrorEvent {
  type: 'error'
  message: string
}

export interface PingEvent {
  type: 'ping'
  timestamp: number
}

export type SSEEvent = ConnectedEvent | UpdateEvent | ErrorEvent | PingEvent
