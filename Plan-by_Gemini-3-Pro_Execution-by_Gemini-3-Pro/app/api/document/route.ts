import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getDocument } from '@/server/document-store'
import { processOperation } from '@/server/ot-engine'
import { broadcast } from '@/server/sse-manager'
import type { Operation } from '@/types/operations'

const insertSchema = z.object({
  type: z.literal('insert'),
  index: z.number().int().min(0),
  text: z.string(),
})

const deleteSchema = z.object({
  type: z.literal('delete'),
  index: z.number().int().min(0),
  length: z.number().int().min(0),
})

const operationSchema = z.union([insertSchema, deleteSchema])

const bodySchema = z.object({
  op: operationSchema,
  clientId: z.string(),
  revision: z.number().int().min(0),
})

export async function GET() {
  const doc = getDocument()
  return NextResponse.json({ text: doc.text, revision: doc.revision })
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { op, clientId, revision } = parsed.data
  const result = processOperation({ op, clientId, revision })

  if (result.applied && result.appliedOp) {
    broadcast(
      {
        type: 'update',
        revision: result.revision,
        op: result.appliedOp,
        sourceClientId: clientId,
      },
      clientId,
    )
  }

  return NextResponse.json({
    ack: true,
    revision: result.revision,
    transformedOp: result.transformedOp,
  })
}
