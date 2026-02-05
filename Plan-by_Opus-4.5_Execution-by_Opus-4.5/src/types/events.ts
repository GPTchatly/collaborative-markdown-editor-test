/**
 * SSE event types for real-time communication.
 */

import type { Operation } from './operations'

/**
 * Connection status for the SSE client.
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'syncing'

/**
 * Event sent when client first connects to SSE stream.
 */
export interface ConnectedEvent {
    type: 'connected'
    revision: number
    clientId: string
}

/**
 * Event sent when another client updates the document.
 */
export interface UpdateEvent {
    type: 'update'
    op: Operation
    sourceClientId: string
    revision: number
}

/**
 * Event confirming an operation was applied.
 */
export interface AckEvent {
    type: 'ack'
    revision: number
    transformedOp?: Operation
}

/**
 * Heartbeat event to keep connection alive.
 */
export interface HeartbeatEvent {
    type: 'heartbeat'
    timestamp: number
}

/**
 * Union of all SSE event types.
 */
export type SSEEvent = ConnectedEvent | UpdateEvent | AckEvent | HeartbeatEvent
