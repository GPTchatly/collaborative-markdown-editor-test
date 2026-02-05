import { getDocument } from '@/server/document-store'
import { addSubscriber } from '@/server/sse-manager'
import type { SSEEvent } from '@/types/events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const encoder = new TextEncoder()
  let unsubscribe: (() => void) | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: SSEEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        } catch {
          // If the stream is closed, ignore send attempts.
        }
      }

      const doc = getDocument()
      send({ type: 'connected', revision: doc.revision, text: doc.text })

      unsubscribe = addSubscriber(send)

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(':\n\n'))
        } catch {
          // ignore
        }
      }, 15000)
    },
    cancel() {
      if (heartbeat) {
        clearInterval(heartbeat)
      }
      if (unsubscribe) {
        unsubscribe()
      }
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
