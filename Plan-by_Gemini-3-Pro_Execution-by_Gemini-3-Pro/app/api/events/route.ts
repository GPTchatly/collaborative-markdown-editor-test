import { NextRequest } from 'next/server'
import { getDocument } from '@/server/document-store'
import { registerClient } from '@/server/sse-manager'
import { serializeSseEvent } from '@/lib/sse/client'
import type { SSEEvent } from '@/types/events'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  const clientId = crypto.randomUUID()

  let cleanup: (() => void) | null = null
  let keepAlive: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(serializeSseEvent(event)))
      }

      cleanup = registerClient(clientId, send)

      const doc = getDocument()
      send({ type: 'connected', revision: doc.revision })

      keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(':keep-alive\n\n'))
      }, 15000)

      request.signal.addEventListener('abort', () => {
        cleanup?.()
        if (keepAlive) {
          clearInterval(keepAlive)
        }
        controller.close()
      })
    },
    cancel() {
      cleanup?.()
      if (keepAlive) {
        clearInterval(keepAlive)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
