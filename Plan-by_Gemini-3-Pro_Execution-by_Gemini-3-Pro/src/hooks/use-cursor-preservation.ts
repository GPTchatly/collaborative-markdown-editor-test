'use client'

import { useEffect, type RefObject } from 'react'

export function useCursorPreservation(ref: any, cursorPosition: number) {
  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    el.setSelectionRange(cursorPosition, cursorPosition)
  }, [cursorPosition, ref])
}
