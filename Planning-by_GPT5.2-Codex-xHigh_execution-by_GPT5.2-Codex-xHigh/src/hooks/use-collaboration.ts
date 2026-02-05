'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { nanoid } from 'nanoid'

import { useSSE } from './use-sse'
import { useDocument } from './use-document'
import { generateOperation, applyOperation } from '@/lib/ot/operations'
import { transformPair } from '@/lib/ot/transform'
import { transformCursorPosition } from '@/lib/utils/cursor'
import type { Document } from '@/types/document'
import type { Operation } from '@/types/operations'
import type { ConnectionStatus, SSEEvent } from '@/types/events'

interface PendingOperation {
  op: Operation
  baseRevision: number
}

export function useCollaboration(initialDocument: Document) {
  const clientId = useMemo(() => nanoid(), [])
  const { text, revision, setText, setRevision } = useDocument(initialDocument)
  const { status, subscribe } = useSSE('/api/events')

  const textRef = useRef(text)
  const revisionRef = useRef(revision)
  const pendingOpsRef = useRef<PendingOperation[]>([])
  const inFlightRef = useRef(false)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [pendingCount, setPendingCount] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)

  useEffect(() => {
    textRef.current = text
  }, [text])

  useEffect(() => {
    revisionRef.current = revision
  }, [revision])

  const flushQueue = useCallback(async () => {
    if (inFlightRef.current) return
    const next = pendingOpsRef.current[0]
    if (!next) return

    inFlightRef.current = true
    let shouldRetry = false

    try {
      const response = await fetch('/api/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          op: next.op,
          clientId,
          revision: next.baseRevision,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send operation')
      }

      const data = (await response.json()) as {
        ack: boolean
        revision: number
        transformedOp?: Operation | null
      }

      if (data.ack) {
        pendingOpsRef.current.shift()
        setPendingCount(pendingOpsRef.current.length)
        setRevision(data.revision)
      }
    } catch {
      shouldRetry = true
    } finally {
      inFlightRef.current = false
      if (shouldRetry) {
        if (!retryTimerRef.current) {
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null
            void flushQueue()
          }, 1000)
        }
        return
      }

      if (pendingOpsRef.current.length > 0) {
        void flushQueue()
      }
    }
  }, [clientId, setRevision])

  const enqueueOperations = useCallback(
    (ops: Operation[]) => {
      if (ops.length === 0) return
      const baseRevision = revisionRef.current + pendingOpsRef.current.length

      ops.forEach((op, index) => {
        pendingOpsRef.current.push({
          op,
          baseRevision: baseRevision + index,
        })
      })

      setPendingCount(pendingOpsRef.current.length)
      void flushQueue()
    },
    [flushQueue],
  )

  const handleIncomingEvent = useCallback(
    (event: SSEEvent) => {
      if (event.type === 'connected') {
        if (pendingOpsRef.current.length === 0) {
          textRef.current = event.text
          setText(event.text)
          setRevision(event.revision)
        }
        return
      }

      if (event.type === 'resync') {
        pendingOpsRef.current = []
        setPendingCount(0)
        textRef.current = event.text
        setText(event.text)
        setRevision(event.revision)
        return
      }

      if (event.sourceClientId === clientId) {
        if (event.revision > revisionRef.current) {
          setRevision(event.revision)
        }
        return
      }

      let incoming: Operation | null = event.op

      for (let i = 0; i < pendingOpsRef.current.length; i += 1) {
        const pending = pendingOpsRef.current[i]
        if (!incoming) break

        const [pendingPrime, incomingPrime] = transformPair(pending.op, incoming, 'right')

        if (pendingPrime) {
          pending.op = pendingPrime
        } else {
          pendingOpsRef.current.splice(i, 1)
          i -= 1
        }

        incoming = incomingPrime
      }

      if (incoming) {
        setText((current) => {
          const next = applyOperation(current, incoming)
          textRef.current = next
          return next
        })
        setCursorPosition((current) => transformCursorPosition(current, incoming))
      }

      setPendingCount(pendingOpsRef.current.length)
      setRevision(event.revision)
    },
    [clientId, setRevision, setText],
  )

  useEffect(() => {
    return subscribe(handleIncomingEvent)
  }, [handleIncomingEvent, subscribe])

  const handleTextChange = useCallback(
    (nextText: string, cursorPos: number) => {
      const previousText = textRef.current
      const ops = generateOperation(previousText, nextText)

      if (ops.length === 0) {
        setCursorPosition(cursorPos)
        return
      }

      textRef.current = nextText
      setText(nextText)
      setCursorPosition(cursorPos)

      enqueueOperations(ops)
    },
    [enqueueOperations, setText],
  )

  const effectiveStatus: ConnectionStatus =
    pendingCount > 0 && status === 'connected' ? 'syncing' : status

  return {
    text,
    status: effectiveStatus,
    revision,
    cursorPosition,
    handleTextChange,
    setCursorPosition,
  }
}
