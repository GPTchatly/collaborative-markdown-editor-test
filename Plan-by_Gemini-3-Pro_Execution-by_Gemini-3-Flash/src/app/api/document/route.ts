import { NextRequest, NextResponse } from 'next/server'
import { documentStore } from '@/server/document-store'
import { OTEngine } from '@/server/ot-engine'
import { sseManager } from '@/server/sse-manager'
import type { OperationMessage } from '@/types/operations'

/**
 * GET: Retrieves the current document state
 */
export async function GET() {
  const doc = documentStore.getDocument()
  return NextResponse.json(doc)
}

/**
 * POST: Accepts a new operation from a client
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OperationMessage

    const { revision, transformedOp } = OTEngine.processOperation(body)

    // Broadcast the update to all other clients
    sseManager.broadcast({
      type: 'update',
      op: transformedOp,
      revision,
      sourceClientId: body.clientId,
    })

    return NextResponse.json({
      ack: true,
      revision,
      transformedOp,
    })
  } catch (error) {
    console.error('Error processing operation:', error)
    return NextResponse.json({ error: 'Failed to process operation' }, { status: 500 })
  }
}
