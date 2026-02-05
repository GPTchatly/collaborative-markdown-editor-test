import { SSEEvent } from '@/types/events'

type Listener = (event: SSEEvent) => void

/**
 * Manages active SSE connections and broadcasts events to all subscribers.
 */
class SSEManager {
  private static instance: SSEManager
  private listeners: Set<Listener> = new Set()

  private constructor() {}

  public static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager()
    }
    return SSEManager.instance
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public broadcast(event: SSEEvent): void {
    this.listeners.forEach((listener) => listener(event))
  }
}

export const sseManager = SSEManager.getInstance()
