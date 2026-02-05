'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useSSE } from './use-sse'
import { generateOperation, applyOperation } from '@/lib/ot/operations'
import { transform } from '@/lib/ot/transform'
import type { Document } from '@/types/document'
import type { Operation } from '@/types/operations'

const CLIENT_ID = nanoid()

/**
 * Hook that orchestrates real-time collaboration.
 */
export function useCollaboration(initialDocument: Document) {
  const [text, setText] = useState(initialDocument.text)
  const [revision, setRevision] = useState(initialDocument.revision)
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'syncing'>(
    'connecting',
  )

  const lastAckRevision = useRef(initialDocument.revision)
  const pendingOp = useRef<Operation | null>(null)
  const inflightOp = useRef<Operation | null>(null)

  const { status: connectionStatus, subscribe } = useSSE('/api/events')

  // Sync status
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setStatus(inflightOp.current ? 'syncing' : 'connected')
    } else {
      setStatus(connectionStatus)
    }
  }, [connectionStatus])

  // Process incoming SSE events
  useEffect(() => {
    return subscribe((event) => {
      if (event.type === 'connected') {
        // Initial revision check could happen here
      } else if (event.type === 'update') {
        if (event.sourceClientId === CLIENT_ID) {
          // Acknowledgment handled in POST response
          return
        }

        // External update received
        let op = event.op

        // Transform against inflight and pending operations
        if (inflightOp.current) {
          op = transform(op, inflightOp.current)
        }
        if (pendingOp.current) {
          op = transform(op, pendingOp.current)
        }

        setText((prev) => applyOperation(prev, op))
        setRevision(event.revision)
        lastAckRevision.current = event.revision
      }
    })
  }, [subscribe])

  const sendNextOp = useCallback(async () => {
    if (inflightOp.current || !pendingOp.current) return

    inflightOp.current = pendingOp.current
    pendingOp.current = null
    setStatus('syncing')

    try {
      const resp = await fetch('/api/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          op: inflightOp.current,
          clientId: CLIENT_ID,
          revision: lastAckRevision.current,
        }),
      })

      const result = await resp.json()
      if (result.ack) {
        lastAckRevision.current = result.revision
        setRevision(result.revision)
        inflightOp.current = null

        if (pendingOp.current) {
          sendNextOp()
        } else {
          setStatus('connected')
        }
      }
    } catch (err) {
      console.error('Failed to send operation:', err)
      // Retry logic could be added here
      inflightOp.current = null
      setStatus('disconnected')
    }
  }, [])

  const handleTextChange = useCallback(
    (newText: string, cursorPos: number) => {
      const op = generateOperation(text, newText, cursorPos)
      setText(newText)

      // Composition: transform new op against pending/inflight
      if (pendingOp.current) {
        // In a real implementation we would compose ops
        // For this lab, we just update the pending op
        pendingOp.current = op
      } else {
        pendingOp.current = op
      }

      sendNextOp()
    },
    [text, sendNextOp],
  )

  return {
    text,
    status,
    revision,
    handleTextChange,
    clientId: CLIENT_ID,
  }
}
