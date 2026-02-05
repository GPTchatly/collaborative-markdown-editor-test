'use client'

/**
 * Hook for cursor position preservation.
 * Tracks and restores cursor position during collaborative editing.
 */

import { useRef, useCallback } from 'react'
import type { Operation } from '@/types/operations'
import { adjustCursorForOperation } from '@/lib/utils/cursor'

export interface CursorState {
    position: number
    selectionStart: number
    selectionEnd: number
}

export interface UseCursorPreservationReturn {
    /** Saves the current cursor state */
    saveCursor: (textarea: HTMLTextAreaElement | null) => void
    /** Restores the cursor state, optionally adjusting for an operation */
    restoreCursor: (textarea: HTMLTextAreaElement | null, operation?: Operation) => void
    /** Gets the current saved cursor position */
    getCursorPosition: () => number
    /** Adjusts saved cursor for a remote operation */
    adjustForOperation: (op: Operation) => void
}

/**
 * Hook for managing cursor preservation during text updates.
 *
 * @returns Cursor preservation methods
 */
export function useCursorPreservation(): UseCursorPreservationReturn {
    const cursorStateRef = useRef<CursorState>({
        position: 0,
        selectionStart: 0,
        selectionEnd: 0,
    })

    /**
     * Saves the current cursor state from a textarea.
     */
    const saveCursor = useCallback((textarea: HTMLTextAreaElement | null) => {
        if (!textarea) return

        cursorStateRef.current = {
            position: textarea.selectionStart,
            selectionStart: textarea.selectionStart,
            selectionEnd: textarea.selectionEnd,
        }
    }, [])

    /**
     * Restores the cursor state to a textarea.
     */
    const restoreCursor = useCallback(
        (textarea: HTMLTextAreaElement | null, operation?: Operation) => {
            if (!textarea) return

            let { selectionStart, selectionEnd } = cursorStateRef.current

            // Adjust for operation if provided
            if (operation) {
                selectionStart = adjustCursorForOperation(selectionStart, operation)
                selectionEnd = adjustCursorForOperation(selectionEnd, operation)
            }

            // Clamp to valid range
            const maxPos = textarea.value.length
            selectionStart = Math.max(0, Math.min(selectionStart, maxPos))
            selectionEnd = Math.max(0, Math.min(selectionEnd, maxPos))

            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                textarea.selectionStart = selectionStart
                textarea.selectionEnd = selectionEnd
            })
        },
        [],
    )

    /**
     * Gets the current saved cursor position.
     */
    const getCursorPosition = useCallback(() => {
        return cursorStateRef.current.position
    }, [])

    /**
     * Adjusts the saved cursor state for a remote operation.
     */
    const adjustForOperation = useCallback((op: Operation) => {
        const state = cursorStateRef.current
        cursorStateRef.current = {
            position: adjustCursorForOperation(state.position, op),
            selectionStart: adjustCursorForOperation(state.selectionStart, op),
            selectionEnd: adjustCursorForOperation(state.selectionEnd, op),
        }
    }, [])

    return {
        saveCursor,
        restoreCursor,
        getCursorPosition,
        adjustForOperation,
    }
}
