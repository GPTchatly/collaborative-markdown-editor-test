'use client'

import { useRef, useCallback } from 'react'

/**
 * Hook to preserve textarea cursor position during external updates.
 */
export function useCursorPreservation() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const applyWithCursor = useCallback((newText: string, updateFn: (text: string) => void) => {
    const textarea = textareaRef.current
    if (!textarea) {
      updateFn(newText)
      return
    }

    const { selectionStart, selectionEnd } = textarea
    updateFn(newText)

    // Wait for DOM update
    requestAnimationFrame(() => {
      if (textarea) {
        textarea.setSelectionRange(selectionStart, selectionEnd)
      }
    })
  }, [])

  return { textareaRef, applyWithCursor }
}
