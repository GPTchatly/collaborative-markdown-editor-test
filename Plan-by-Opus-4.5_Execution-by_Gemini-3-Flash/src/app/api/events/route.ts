import { type NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import { getDocument } from '@/server/document-store'
import { sseManager } from '@/server/sse-manager'
import type { ConnectedEvent, PingEvent } from '@/types/events'

export const dynamic = 'force-dynamic'

/**
 * GET /api/events
 * Server-Sent Events endpoint for real-time updates
 */
export async function GET(request: NextRequest) {
  const clientId = nanoid()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Register client
      sseManager.addClient(clientId, controller)

      // Send initial connected event
      const doc = getDocument()
      const connectedEvent: ConnectedEvent = {
        type: 'connected',
        revision: doc.revision,
        clientId,
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectedEvent)}\n\n`))

      // Set up ping interval to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          const pingEvent: PingEvent = {
            type: 'ping',
            timestamp: Date.now(),
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(pingEvent)}\n\n`))
        } catch {
          clearInterval(pingInterval)
        }
      }, 30000)

      // Handle client disconnect via abort signal
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval)
        sseManager.removeClient(clientId)
      })
    },
    cancel() {
      sseManager.removeClient(clientId)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
