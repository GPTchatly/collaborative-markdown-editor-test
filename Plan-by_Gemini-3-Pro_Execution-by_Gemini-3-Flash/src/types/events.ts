export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'syncing'

export interface SSEUpdateEvent {
  type: 'update'
  op: any // Operation type will be used at runtime
  revision: number
  sourceClientId: string
}

export interface SSEConnectedEvent {
  type: 'connected'
  revision: number
}

export type SSEEvent = SSEUpdateEvent | SSEConnectedEvent
