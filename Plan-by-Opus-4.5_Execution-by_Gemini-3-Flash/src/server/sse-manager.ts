import type { SSEEvent, UpdateEvent } from '@/types/events'
import type { Operation } from '@/types/operations'

type SSEController = ReadableStreamDefaultController<Uint8Array>

interface Client {
  id: string
  controller: SSEController
}

/**
 * Manages SSE connections for real-time updates
 */
class SSEManager {
  private clients = new Map<string, Client>()
  private encoder = new TextEncoder()

  /**
   * Registers a new client connection
   */
  addClient(id: string, controller: SSEController): void {
    this.clients.set(id, { id, controller })
  }

  /**
   * Removes a client connection
   */
  removeClient(id: string): void {
    this.clients.delete(id)
  }

  /**
   * Sends an event to a specific client
   */
  sendToClient(clientId: string, event: SSEEvent): void {
    const client = this.clients.get(clientId)
    if (client) {
      const data = `data: ${JSON.stringify(event)}\n\n`
      client.controller.enqueue(this.encoder.encode(data))
    }
  }

  /**
   * Broadcasts an update to all clients except the source
   */
  broadcast(op: Operation, sourceClientId: string, revision: number): void {
    const event: UpdateEvent = {
      type: 'update',
      op,
      sourceClientId,
      revision,
    }

    for (const [clientId, client] of this.clients) {
      if (clientId !== sourceClientId) {
        const data = `data: ${JSON.stringify(event)}\n\n`
        client.controller.enqueue(this.encoder.encode(data))
      }
    }
  }

  /**
   * Gets currently connected client count
   */
  getClientCount(): number {
    return this.clients.size
  }
}

// Singleton instance
export const sseManager = new SSEManager()
