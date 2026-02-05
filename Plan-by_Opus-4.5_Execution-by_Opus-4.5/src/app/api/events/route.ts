/**
 * SSE (Server-Sent Events) API route handler.
 * Provides real-time updates to connected clients.
 */

import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import { getDocument, registerClient, unregisterClient } from '@/server/document-store'
import { registerSSEConnection, unregisterSSEConnection } from '@/server/sse-manager'

/**
 * GET /api/events
 * Establishes an SSE connection for real-time updates.
 */
export async function GET(request: NextRequest) {
    // Get client ID from query params or generate a new one
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || nanoid()

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        start(controller) {
            // Register the client and SSE connection
            registerClient(clientId)
            registerSSEConnection(clientId, controller)

            // Send initial connected event with current document state
            const doc = getDocument()
            const connectedEvent = {
                type: 'connected',
                revision: doc.revision,
                clientId,
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectedEvent)}\n\n`))

            // Set up periodic heartbeat to keep connection alive
            const heartbeatInterval = setInterval(() => {
                try {
                    const heartbeat = {
                        type: 'heartbeat',
                        timestamp: Date.now(),
                    }
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(heartbeat)}\n\n`))
                } catch {
                    // Connection might be closed
                    clearInterval(heartbeatInterval)
                }
            }, 30000) // Send heartbeat every 30 seconds

            // Store the interval ID for cleanup
            // We use a custom approach since we can't directly access the interval in cancel
            const cleanup = () => {
                clearInterval(heartbeatInterval)
                unregisterSSEConnection(clientId)
                unregisterClient(clientId)
            }

            // Listen for abort signal (client disconnect)
            request.signal.addEventListener('abort', cleanup)
        },
        cancel() {
            // Cleanup when stream is cancelled (should be handled by abort listener)
            unregisterSSEConnection(clientId)
            unregisterClient(clientId)
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no', // Disable nginx buffering
        },
    })
}
