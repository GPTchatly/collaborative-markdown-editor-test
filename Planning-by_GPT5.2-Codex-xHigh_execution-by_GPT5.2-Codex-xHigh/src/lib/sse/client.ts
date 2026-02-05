import type { SSEEvent } from '@/types/events'

export function parseSSEMessage(data: string): SSEEvent | null {
  try {
    const parsed = JSON.parse(data) as SSEEvent
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    if (!('type' in parsed)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}
