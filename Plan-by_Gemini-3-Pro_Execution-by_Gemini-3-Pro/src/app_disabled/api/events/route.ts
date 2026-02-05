import { NextRequest } from 'next/server'
import { addListener } from '@/server/sse-manager'
import { getDocument } from '@/server/document-store'

export async function GET(request: NextRequest) {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        start(controller) {
            const send = (data: string) => {
                controller.enqueue(encoder.encode(data))
            }

            // Send initial connected event
            const doc = getDocument()
            send(`data: ${JSON.stringify({ type: 'connected', revision: doc.revision })}\n\n`)

            const unsubscribe = addListener(send)

            // Cleanup on close is not directly exposed in simple ReadableStream without strict abort handling,
            // but in Next.js App Router, the stream closure should handle it eventually.
            // Ideally we listen to request.signal.
            request.signal.addEventListener('abort', () => {
                unsubscribe()
            })
        },
        cancel() {
            // logic handled in abort listener usually
        }
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
}
