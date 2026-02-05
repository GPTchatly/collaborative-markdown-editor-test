import type { SSEEvent } from '@/types/events'

type Subscriber = (event: SSEEvent) => void

const globalForSSE = globalThis as unknown as {
  __collabSubscribers?: Set<Subscriber>
}

const subscribers = globalForSSE.__collabSubscribers ?? new Set<Subscriber>()

if (!globalForSSE.__collabSubscribers) {
  globalForSSE.__collabSubscribers = subscribers
}

export function addSubscriber(callback: Subscriber) {
  subscribers.add(callback)
  return () => {
    subscribers.delete(callback)
  }
}

export function broadcast(event: SSEEvent) {
  subscribers.forEach((callback) => {
    callback(event)
  })
}
