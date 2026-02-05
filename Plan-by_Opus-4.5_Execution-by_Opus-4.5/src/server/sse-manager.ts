/**
 * SSE (Server-Sent Events) connection manager.
 * Handles broadcasting events to connected clients.
 */

import type { SSEEvent } from '@/types/events'

type SSEController = ReadableStreamDefaultController<Uint8Array>

interface SSEConnection {
    controller: SSEController
    clientId: string
    connectedAt: Date
}

/**
 * Map of client IDs to their SSE connections.
 */
const connections = new Map<string, SSEConnection>()

/**
 * TextEncoder for SSE message encoding.
 */
const encoder = new TextEncoder()

/**
 * Formats data as an SSE message.
 */
function formatSSEMessage(data: unknown): string {
    return `data: ${JSON.stringify(data)}\n\n`
}

/**
 * Registers an SSE connection.
 *
 * @param clientId - Unique client identifier
 * @param controller - ReadableStream controller for sending events
 */
export function registerSSEConnection(clientId: string, controller: SSEController): void {
    connections.set(clientId, {
        controller,
        clientId,
        connectedAt: new Date(),
    })
    console.log(`[SSE] Client connected: ${clientId}. Total connections: ${connections.size}`)
}

/**
 * Unregisters an SSE connection.
 *
 * @param clientId - Client ID to unregister
 */
export function unregisterSSEConnection(clientId: string): void {
    const connection = connections.get(clientId)
    if (connection) {
        try {
            connection.controller.close()
        } catch {
            // Controller might already be closed
        }
        connections.delete(clientId)
        console.log(`[SSE] Client disconnected: ${clientId}. Total connections: ${connections.size}`)
    }
}

/**
 * Sends an event to a specific client.
 *
 * @param clientId - Target client ID
 * @param event - Event data to send
 * @returns true if sent successfully, false otherwise
 */
export function sendToClient(clientId: string, event: SSEEvent): boolean {
    const connection = connections.get(clientId)
    if (!connection) {
        return false
    }

    try {
        const message = formatSSEMessage(event)
        connection.controller.enqueue(encoder.encode(message))
        return true
    } catch (error) {
        console.error(`[SSE] Failed to send to client ${clientId}:`, error)
        unregisterSSEConnection(clientId)
        return false
    }
}

/**
 * Broadcasts an event to all connected clients.
 *
 * @param event - Event data to broadcast
 * @param excludeClientId - Optional client ID to exclude from broadcast
 */
export function broadcast(event: SSEEvent, excludeClientId?: string): void {
    const message = formatSSEMessage(event)
    const encoded = encoder.encode(message)

    for (const [clientId, connection] of connections) {
        if (clientId === excludeClientId) {
            continue
        }

        try {
            connection.controller.enqueue(encoded)
        } catch (error) {
            console.error(`[SSE] Failed to broadcast to client ${clientId}:`, error)
            unregisterSSEConnection(clientId)
        }
    }
}

/**
 * Gets the number of active connections.
 */
export function getConnectionCount(): number {
    return connections.size
}

/**
 * Gets all connected client IDs.
 */
export function getConnectedClientIds(): string[] {
    return Array.from(connections.keys())
}

/**
 * Sends a heartbeat to all clients to keep connections alive.
 */
export function sendHeartbeatToAll(): void {
    broadcast({
        type: 'heartbeat',
        timestamp: Date.now(),
    })
}

/**
 * Cleans up stale connections (for testing/reset).
 */
export function clearAllConnections(): void {
    for (const clientId of connections.keys()) {
        unregisterSSEConnection(clientId)
    }
}
