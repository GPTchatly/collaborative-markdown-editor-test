import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getDocument, applyOperation } from '@/server/document-store'
import { sseManager } from '@/server/sse-manager'

const OperationSchema = z.object({
  op: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('insert'),
      index: z.number().int().nonnegative(),
      text: z.string(),
    }),
    z.object({
      type: z.literal('delete'),
      index: z.number().int().nonnegative(),
      length: z.number().int().nonnegative(),
    }),
  ]),
  clientId: z.string().min(1),
  revision: z.number().int().nonnegative(),
})

/**
 * GET /api/document
 * Returns current document state
 */
export async function GET() {
  const doc = getDocument()
  return NextResponse.json(doc)
}

/**
 * POST /api/document
 * Applies an operation to the document
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = OperationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid operation', details: parsed.error.issues },
        { status: 400 },
      )
    }

    const { revision, appliedOp } = applyOperation(parsed.data)

    // Broadcast to other connected clients
    sseManager.broadcast(appliedOp, parsed.data.clientId, revision)

    return NextResponse.json({
      ack: true,
      revision,
      transformedOp: appliedOp !== parsed.data.op ? appliedOp : undefined,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to process operation' }, { status: 500 })
  }
}
