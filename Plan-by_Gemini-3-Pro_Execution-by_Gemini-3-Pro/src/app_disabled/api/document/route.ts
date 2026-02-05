import { NextResponse } from 'next/server'
import { getDocument } from '@/server/document-store'
import { processOperation } from '@/server/ot-engine'
import { broadcastUpdate } from '@/server/sse-manager'
import type { Operation } from '@/types/operations'

export async function GET() {
    const doc = getDocument()
    return NextResponse.json(doc)
}

export async function POST(request: Request) {
    const body = await request.json()
    const { op, revision, clientId } = body as { op: Operation, revision: number, clientId: string }

    const result = processOperation(op, revision, clientId)

    if (result.ack && result.transformedOp) {
        // Broadcast to other clients
        broadcastUpdate(result.transformedOp, result.revision, clientId)
    }

    return NextResponse.json(result)
}
