/**
 * Document-related types for the collaborative markdown editor.
 */

import type { Operation, OperationRecord } from './operations'

/**
 * Basic document state returned from API.
 */
export interface Document {
    text: string
    revision: number
}

/**
 * Information about a connected client.
 */
export interface ClientInfo {
    id: string
    cursorPosition: number
    lastSeen: Date
}

/**
 * Full document state maintained on the server.
 */
export interface DocumentState {
    text: string
    revision: number
    clients: Map<string, ClientInfo>
    history: OperationRecord[]
}
