'use client'

/**
 * Combined collaboration hook.
 * Integrates document state, SSE, and OT logic together.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { nanoid } from 'nanoid'
import type { Document } from '@/types/document'
import type { Operation, OperationAck } from '@/types/operations'
import type { SSEEvent, ConnectionStatus } from '@/types/events'
import { useDocument } from './use-document'
import { useSSE } from './use-sse'
import { useCursorPreservation } from './use-cursor-preservation'
import { generateOperation } from '@/lib/ot/operations'
import { transform } from '@/lib/ot/transform'

export interface UseCollaborationOptions {
    initialDocument: Document
    textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}

export interface UseCollaborationReturn {
    text: string
    status: ConnectionStatus
    revision: number
    clientId: string
    handleTextChange: (newText: string, cursorPosition: number) => void
}

/**
 * Combined hook for real-time collaborative editing.
 *
 * @param options - Collaboration options
 * @returns Collaboration state and handlers
 */
export function useCollaboration(options: UseCollaborationOptions): UseCollaborationReturn {
    const { initialDocument, textareaRef } = options

    // Generate a unique client ID
    const [clientId] = useState(() => nanoid())

    // Document state
    const { text, revision, setText, setRevision, applyRemoteOperation } =
        useDocument(initialDocument)

    // Pending operations that haven't been acknowledged yet
    const pendingOpsRef = useRef<Array<{ op: Operation; revision: number }>>([])

    // Last acknowledged revision
    const lastAckedRevisionRef = useRef(initialDocument.revision)

    // Cursor preservation
    const { saveCursor, restoreCursor, adjustForOperation } = useCursorPreservation()

    // Syncing status
    const [isSyncing, setIsSyncing] = useState(false)

    /**
     * Sends an operation to the server.
     */
    const sendOperation = useCallback(
        async (op: Operation, baseRevision: number) => {
            try {
                setIsSyncing(true)
                const response = await fetch('/api/document', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        op,
                        clientId,
                        revision: baseRevision,
                    }),
                })

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`)
                }

                const result = (await response.json()) as OperationAck
                lastAckedRevisionRef.current = result.revision

                // Remove the acknowledged operation from pending
                pendingOpsRef.current = pendingOpsRef.current.filter((p) => p.revision !== baseRevision)

                // Update local revision
                setRevision(result.revision)
            } catch (error) {
                console.error('[Collaboration] Failed to send operation:', error)
                // On error, we might need to resync
                // For now, just remove from pending
                pendingOpsRef.current = pendingOpsRef.current.filter((p) => p.revision !== baseRevision)
            } finally {
                setIsSyncing(false)
            }
        },
        [clientId, setRevision],
    )

    /**
     * Handles incoming SSE events.
     */
    const handleSSEEvent = useCallback(
        (event: SSEEvent) => {
            if (event.type === 'update') {
                // Skip our own operations
                if (event.sourceClientId === clientId) {
                    return
                }

                // Transform pending operations against the incoming operation
                const transformedPending: Array<{ op: Operation; revision: number }> = []
                let incomingOp = event.op

                for (const pending of pendingOpsRef.current) {
                    const transformedIncoming = transform(incomingOp, pending.op)
                    const transformedPendingOp = transform(pending.op, incomingOp)
                    transformedPending.push({ op: transformedPendingOp, revision: pending.revision })
                    incomingOp = transformedIncoming
                }

                pendingOpsRef.current = transformedPending

                // Save cursor before applying
                saveCursor(textareaRef?.current ?? null)

                // Adjust cursor for the operation
                adjustForOperation(incomingOp)

                // Apply the (possibly transformed) remote operation
                applyRemoteOperation(incomingOp, event.revision)

                // Restore cursor
                restoreCursor(textareaRef?.current ?? null)
            } else if (event.type === 'ack') {
                // Acknowledgment already handled in sendOperation
                lastAckedRevisionRef.current = event.revision
            }
        },
        [
            clientId,
            saveCursor,
            adjustForOperation,
            applyRemoteOperation,
            restoreCursor,
            textareaRef,
        ],
    )

    /**
     * Handles connected event.
     */
    const handleConnected = useCallback(
        (event: SSEEvent & { type: 'connected' }) => {
            console.log(`[Collaboration] Connected as ${event.clientId} at revision ${event.revision}`)
            lastAckedRevisionRef.current = event.revision
            setRevision(event.revision)
        },
        [setRevision],
    )

    // SSE connection
    const { status: sseStatus, subscribe } = useSSE({
        url: '/api/events',
        clientId,
        autoConnect: true,
        onConnected: handleConnected,
    })

    // Subscribe to SSE events
    useEffect(() => {
        return subscribe(handleSSEEvent)
    }, [subscribe, handleSSEEvent])

    /**
     * Handles text changes from the editor.
     */
    const handleTextChange = useCallback(
        (newText: string, cursorPosition: number) => {
            // Generate operation from the change
            const op = generateOperation(text, newText, cursorPosition)

            if (!op) {
                return
            }

            // Apply locally first
            setText(newText)

            // Add to pending and send
            const baseRevision = lastAckedRevisionRef.current
            pendingOpsRef.current.push({ op, revision: baseRevision })
            sendOperation(op, baseRevision)
        },
        [text, setText, sendOperation],
    )

    // Compute display status
    const status: ConnectionStatus = isSyncing ? 'syncing' : sseStatus

    return {
        text,
        status,
        revision,
        clientId,
        handleTextChange,
    }
}
