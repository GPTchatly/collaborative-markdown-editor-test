'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSSE } from './use-sse'
import { useCursorPreservation } from './use-cursor-preservation'
import { generateOperation, applyOperation } from '@/lib/ot/operations'
import type { Document } from '@/types/document'
import type { Operation } from '@/types/operations'

/**
 * Main collaboration hook combining document state, SSE, and OT
 */
export function useCollaboration(
  initialDocument: Document,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
) {
  const [text, setText] = useState(initialDocument.text)
  const [revision, setRevision] = useState(initialDocument.revision)
  const lastTextRef = useRef(initialDocument.text)
  const pendingOpsRef = useRef<Operation[]>([])

  const { status, clientId, subscribe } = useSSE('/api/events')
  const { saveCursor, transformAndRestoreCursor } = useCursorPreservation(textareaRef)

  // Handle incoming SSE updates
  useEffect(() => {
    return subscribe((event) => {
      if (event.type === 'update' && event.sourceClientId !== clientId) {
        // Save cursor before applying remote operation
        saveCursor()

        // Apply remote operation
        const newText = applyOperation(text, event.op)
        setText(newText)
        lastTextRef.current = newText
        setRevision(event.revision)

        // Transform and restore cursor
        transformAndRestoreCursor(event.op)
      }
    })
  }, [subscribe, clientId, text, saveCursor, transformAndRestoreCursor])

  const handleTextChange = useCallback(
    async (newText: string, cursorPosition: number) => {
      const op = generateOperation(lastTextRef.current, newText, cursorPosition)

      if (!op) return

      // Optimistically update local state
      setText(newText)
      lastTextRef.current = newText

      // Send operation to server
      try {
        const response = await fetch('/api/document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            op,
            clientId,
            revision,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setRevision(result.revision)

          // If operation was transformed, apply the transformation
          if (result.transformedOp) {
            const correctedText = applyOperation(lastTextRef.current, result.transformedOp)
            setText(correctedText)
            lastTextRef.current = correctedText
          }
        }
      } catch (error) {
        console.error('Failed to send operation:', error)
      }
    },
    [clientId, revision],
  )

  return {
    text,
    status,
    revision,
    clientId,
    handleTextChange,
  }
}
