import type { SSEEvent } from '@/types/events'

export function serializeSseEvent(event: SSEEvent) {
  return `data: ${JSON.stringify(event)}\n\n`
}
