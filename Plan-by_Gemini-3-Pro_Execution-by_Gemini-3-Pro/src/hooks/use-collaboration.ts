'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import type { DocumentSnapshot } from '@/types/document'
import type { Operation } from '@/types/operations'
import type { SSEEvent, ConnectionStatus } from '@/types/events'
import { useSSE } from './use-sse'
import { applyOperation, applyOperations, generateOperations } from '@/lib/ot/operations'
import { transform } from '@/lib/ot/transform'
import { transformCursor } from '@/lib/utils/cursor'

interface CollaborationState {
  text: string
  status: ConnectionStatus
  revision: number
  cursorPosition: number
  handleTextChange: (nextText: string, cursorPos: number) => void
}

export function useCollaboration(initialDocument: DocumentSnapshot): CollaborationState {
  const [text, setText] = useState(initialDocument.text)
  const [revision, setRevision] = useState(initialDocument.revision)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  const clientId = useMemo(() => nanoid(), [])
  const baseTextRef = useRef(initialDocument.text)
  const pendingOpsRef = useRef<Operation[]>([])
  const revisionRef = useRef(initialDocument.revision)
  const queueRef = useRef<Operation[]>([])
  const sendingRef = useRef(false)

  const { status: connectionStatus, subscribe } = useSSE('/api/events')

  useEffect(() => {
    revisionRef.current = revision
  }, [revision])

  const recomputeText = useCallback(() => {
    const nextText = applyOperations(baseTextRef.current, pendingOpsRef.current)
    setText(nextText)
  }, [])

  const transformIncoming = useCallback((incoming: Operation) => {
    let transformedIncoming: Operation | null = incoming
    const updatedPending: Operation[] = []

    for (const pending of pendingOpsRef.current) {
      if (transformedIncoming) {
        transformedIncoming = transform(transformedIncoming, pending)
      }

      const transformedPending = transform(pending, incoming)
      if (transformedPending) {
        updatedPending.push(transformedPending)
      }
    }

    pendingOpsRef.current = updatedPending
    return transformedIncoming
  }, [])

  const handleIncomingEvent = useCallback(
    (event: SSEEvent) => {
      if (event.type === 'connected') {
        setRevision(event.revision)
        revisionRef.current = event.revision
        return
      }

      if (event.type !== 'update') {
        return
      }

      if (event.sourceClientId === clientId) {
        return
      }

      const transformedIncoming = transformIncoming(event.op)
      baseTextRef.current = applyOperation(baseTextRef.current, event.op)

      if (transformedIncoming) {
        setCursorPosition((current) => transformCursor(current, transformedIncoming))
      }

      setRevision(event.revision)
      revisionRef.current = event.revision
      recomputeText()
    },
    [clientId, recomputeText, transformIncoming],
  )

  useEffect(() => {
    return subscribe(handleIncomingEvent)
  }, [handleIncomingEvent, subscribe])

  const flushQueue = useCallback(async () => {
    if (sendingRef.current) {
      return
    }

    const next = queueRef.current.shift()
    if (!next) {
      setIsSyncing(false)
      return
    }

    sendingRef.current = true
    setIsSyncing(true)

    try {
      const response = await fetch('/api/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          op: next,
          clientId,
          revision: revisionRef.current,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to sync operation')
      }

      const data = (await response.json()) as {
        ack: true
        revision: number
        transformedOp?: Operation
      }

      const appliedOp = data.transformedOp ?? next
      baseTextRef.current = applyOperation(baseTextRef.current, appliedOp)

      pendingOpsRef.current = pendingOpsRef.current.slice(1)

      const transformedOp = data.transformedOp
      if (transformedOp) {
        pendingOpsRef.current = pendingOpsRef.current
          .map((op) => transform(op, transformedOp))
          .filter((op): op is Operation => Boolean(op))
      }

      setRevision(data.revision)
      revisionRef.current = data.revision
      recomputeText()
    } catch (error) {
      console.error(error)
    } finally {
      sendingRef.current = false
      flushQueue()
    }
  }, [clientId, recomputeText])

  const enqueueOperation = useCallback(
    (op: Operation) => {
      pendingOpsRef.current = [...pendingOpsRef.current, op]
      queueRef.current = [...queueRef.current, op]
      flushQueue()
    },
    [flushQueue],
  )

  const handleTextChange = useCallback(
    (nextText: string, cursorPos: number) => {
      setCursorPosition(cursorPos)
      const operations = generateOperations(text, nextText)
      if (operations.length === 0) {
        return
      }

      setText(nextText)
      for (const op of operations) {
        enqueueOperation(op)
      }
    },
    [enqueueOperation, text],
  )

  const status: ConnectionStatus = isSyncing ? 'syncing' : connectionStatus

  return {
    text,
    status,
    revision,
    cursorPosition,
    handleTextChange,
  }
}
