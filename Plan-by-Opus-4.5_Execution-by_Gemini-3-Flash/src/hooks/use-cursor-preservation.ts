'use client'

import { useRef, useCallback } from 'react'
import { transformCursor, setCursorPosition } from '@/lib/utils/cursor'
import type { Operation } from '@/types/operations'

/**
 * Hook for preserving cursor position during collaborative edits
 */
export function useCursorPreservation(textareaRef: React.RefObject<HTMLTextAreaElement | null>) {
  const cursorPositionRef = useRef(0)

  const saveCursor = useCallback(() => {
    if (textareaRef.current) {
      cursorPositionRef.current = textareaRef.current.selectionStart
    }
  }, [textareaRef])

  const restoreCursor = useCallback(() => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current, cursorPositionRef.current)
    }
  }, [textareaRef])

  const transformAndRestoreCursor = useCallback(
    (op: Operation) => {
      const newPosition = transformCursor(cursorPositionRef.current, op)
      cursorPositionRef.current = newPosition
      if (textareaRef.current) {
        setCursorPosition(textareaRef.current, newPosition)
      }
    },
    [textareaRef],
  )

  return {
    saveCursor,
    restoreCursor,
    transformAndRestoreCursor,
  }
}
