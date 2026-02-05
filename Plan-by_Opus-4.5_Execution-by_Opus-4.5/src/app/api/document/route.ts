/**
 * Document API route handler.
 * Handles GET (fetch document) and POST (submit operation) requests.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDocument, registerClient } from '@/server/document-store'
import { processOperation } from '@/server/ot-engine'

/**
 * Schema for validating incoming operation requests.
 */
const operationRequestSchema = z.object({
    op: z.discriminatedUnion('type', [
        z.object({
            type: z.literal('insert'),
            index: z.number().nonnegative(),
            text: z.string(),
        }),
        z.object({
            type: z.literal('delete'),
            index: z.number().nonnegative(),
            length: z.number().positive(),
        }),
    ]),
    clientId: z.string().min(1),
    revision: z.number().nonnegative(),
})

/**
 * GET /api/document
 * Returns the current document state.
 */
export async function GET() {
    try {
        const doc = getDocument()
        return NextResponse.json({
            text: doc.text,
            revision: doc.revision,
        })
    } catch (error) {
        console.error('[API] GET /api/document error:', error)
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
    }
}

/**
 * POST /api/document
 * Applies an operation to the document.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate the request body
        const parseResult = operationRequestSchema.safeParse(body)
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parseResult.error.issues },
                { status: 400 },
            )
        }

        const { op, clientId, revision } = parseResult.data

        // Register the client if not already registered
        registerClient(clientId)

        // Process the operation
        const result = processOperation(op, clientId, revision)

        return NextResponse.json(result)
    } catch (error) {
        console.error('[API] POST /api/document error:', error)
        return NextResponse.json({ error: 'Failed to process operation' }, { status: 500 })
    }
}
