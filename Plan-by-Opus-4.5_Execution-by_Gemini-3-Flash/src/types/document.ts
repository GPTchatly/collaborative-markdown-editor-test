/**
 * Document represents the collaborative document state
 */
export interface Document {
  text: string
  revision: number
}

/**
 * DocumentWithHistory includes operation history for OT
 */
export interface DocumentWithHistory extends Document {
  operations: OperationRecord[]
  clients: Map<string, ClientInfo>
}

export interface OperationRecord {
  op: import('./operations').Operation
  clientId: string
  revision: number
  timestamp: number
}

export interface ClientInfo {
  id: string
  lastSeen: number
  cursorPosition?: number
}
