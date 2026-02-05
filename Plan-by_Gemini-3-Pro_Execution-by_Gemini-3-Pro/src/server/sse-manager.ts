import type { SSEEvent } from '@/types/events'

interface ClientConnection {
  id: string
  send: (event: SSEEvent) => void
}

interface SseManager {
  clients: Map<string, ClientConnection>
}

const globalForSse = globalThis as unknown as { __sseManager?: SseManager }

function getManager(): SseManager {
  if (!globalForSse.__sseManager) {
    globalForSse.__sseManager = { clients: new Map() }
  }
  return globalForSse.__sseManager
}

export function registerClient(id: string, send: (event: SSEEvent) => void) {
  const manager = getManager()
  manager.clients.set(id, { id, send })

  return () => {
    manager.clients.delete(id)
  }
}

export function broadcast(event: SSEEvent, excludeId?: string) {
  const manager = getManager()
  for (const [id, client] of manager.clients) {
    if (excludeId && id === excludeId) {
      continue
    }
    client.send(event)
  }
}

export function activeClientsCount() {
  return getManager().clients.size
}
