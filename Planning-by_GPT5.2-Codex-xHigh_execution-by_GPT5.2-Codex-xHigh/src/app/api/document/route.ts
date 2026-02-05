import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getDocument } from '@/server/document-store'
import { processOperation } from '@/server/ot-engine'
import { broadcast } from '@/server/sse-manager'
import type { SSEEvent } from '@/types/events'

const insertSchema = z.object({
  type: z.literal('insert'),
  index: z.number().int().nonnegative(),
  text: z.string(),
})

const deleteSchema = z.object({
  type: z.literal('delete'),
  index: z.number().int().nonnegative(),
  length: z.number().int().nonnegative(),
})

const operationSchema = z.discriminatedUnion('type', [insertSchema, deleteSchema])

const messageSchema = z.object({
  op: operationSchema,
  clientId: z.string().min(1),
  revision: z.number().int().nonnegative(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  const doc = getDocument()
  return NextResponse.json({ text: doc.text, revision: doc.revision })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = messageSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid operation payload' }, { status: 400 })
  }

  const result = processOperation(parsed.data)

  if (result.transformedOp) {
    const event: SSEEvent = {
      type: 'update',
      op: result.transformedOp,
      revision: result.revision,
      sourceClientId: parsed.data.clientId,
    }
    broadcast(event)
  }

  return NextResponse.json(result)
}
