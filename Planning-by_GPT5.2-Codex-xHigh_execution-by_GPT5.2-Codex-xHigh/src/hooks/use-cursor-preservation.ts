'use client'

import { useCallback, useRef } from 'react'

import type { Operation } from '@/types/operations'
import { transformCursorPosition } from '@/lib/utils/cursor'

export function useCursorPreservation() {
  const cursorRef = useRef(0)

  const setCursor = useCallback((position: number) => {
    cursorRef.current = position
  }, [])

  const shiftCursor = useCallback((op: Operation) => {
    cursorRef.current = transformCursorPosition(cursorRef.current, op)
  }, [])

  const getCursor = useCallback(() => cursorRef.current, [])

  return {
    cursorRef,
    setCursor,
    shiftCursor,
    getCursor,
  }
}
