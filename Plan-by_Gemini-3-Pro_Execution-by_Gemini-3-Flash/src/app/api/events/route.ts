import { NextRequest } from 'next/server'
import { sseManager } from '@/server/sse-manager'
import { documentStore } from '@/server/document-store'

/**
 * GET: Establishes an SSE connection
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial connection event
      sendEvent({
        type: 'connected',
        revision: documentStore.getRevision(),
      })

      // Subscribe to broadcasts
      const unsubscribe = sseManager.subscribe((event) => {
        sendEvent(event)
      })

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
