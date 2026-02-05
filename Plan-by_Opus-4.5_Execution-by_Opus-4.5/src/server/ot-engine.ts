/**
 * Server-side OT engine.
 * Handles receiving, transforming, and applying operations.
 */

import type { Operation, OperationAck } from '@/types/operations'
import type { UpdateEvent } from '@/types/events'
import { getOTDocument, updateClientCursor } from './document-store'
import { broadcast, sendToClient } from './sse-manager'

/**
 * Processes an incoming operation from a client.
 *
 * @param op - The operation to process
 * @param clientId - The client that sent the operation
 * @param baseRevision - The revision the operation was based on
 * @returns The acknowledgment with the new revision and transformed operation if any
 */
export function processOperation(
    op: Operation,
    clientId: string,
    baseRevision: number,
): OperationAck {
    const document = getOTDocument()
    const currentRevision = document.revision

    let transformedOp: Operation | undefined
    let finalOp = op

    // If the client is behind, transform the operation
    if (baseRevision < currentRevision) {
        finalOp = document.transformOperation(op, baseRevision)
        transformedOp = finalOp
    }

    // Apply the (possibly transformed) operation
    const newRevision = document.applyOperation(finalOp, clientId)

    // Update client's cursor position
    if (finalOp.type === 'insert') {
        updateClientCursor(clientId, finalOp.index + finalOp.text.length)
    } else {
        updateClientCursor(clientId, finalOp.index)
    }

    // Broadcast the update to all other clients
    const updateEvent: UpdateEvent = {
        type: 'update',
        op: finalOp,
        sourceClientId: clientId,
        revision: newRevision,
    }
    broadcast(updateEvent, clientId)

    // Send acknowledgment to the originating client
    sendToClient(clientId, {
        type: 'ack',
        revision: newRevision,
        transformedOp,
    })

    console.log(
        `[OT] Processed op from ${clientId}: ${finalOp.type} at ${finalOp.type === 'insert' ? finalOp.index : finalOp.index} (rev ${baseRevision} -> ${newRevision})`,
    )

    return {
        ack: true,
        revision: newRevision,
        transformedOp,
    }
}

/**
 * Gets the current document state for a client.
 */
export function getDocumentState(): { text: string; revision: number } {
    return getOTDocument().snapshot()
}

/**
 * Gets operations since a given revision (for client catch-up).
 */
export function getOperationsSince(revision: number) {
    return getOTDocument().getOperationsSince(revision)
}
