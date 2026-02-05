'use client'

/**
 * Hook for managing local document state.
 * Handles text updates and revision tracking.
 */

import { useState, useCallback, useRef } from 'react'
import type { Document } from '@/types/document'
import type { Operation } from '@/types/operations'
import { applyOperation } from '@/lib/ot/operations'

export interface UseDocumentReturn {
    text: string
    revision: number
    setText: (newText: string) => void
    setRevision: (newRevision: number) => void
    applyRemoteOperation: (op: Operation, newRevision: number) => void
    initialize: (doc: Document) => void
}

/**
 * Hook for managing document state.
 *
 * @param initialDocument - Initial document state
 * @returns Document state and update methods
 */
export function useDocument(initialDocument: Document): UseDocumentReturn {
    const [text, setTextState] = useState(initialDocument.text)
    const [revision, setRevisionState] = useState(initialDocument.revision)

    // Use ref to track the latest text for proper operation application
    const textRef = useRef(text)
    textRef.current = text

    /**
     * Sets the text directly (for local edits).
     */
    const setText = useCallback((newText: string) => {
        setTextState(newText)
        textRef.current = newText
    }, [])

    /**
     * Sets the revision number.
     */
    const setRevision = useCallback((newRevision: number) => {
        setRevisionState(newRevision)
    }, [])

    /**
     * Applies a remote operation to the document.
     */
    const applyRemoteOperation = useCallback((op: Operation, newRevision: number) => {
        try {
            const newText = applyOperation(textRef.current, op)
            setTextState(newText)
            textRef.current = newText
            setRevisionState(newRevision)
        } catch (error) {
            console.error('[useDocument] Failed to apply remote operation:', error)
        }
    }, [])

    /**
     * Initializes/resets the document state.
     */
    const initialize = useCallback((doc: Document) => {
        setTextState(doc.text)
        textRef.current = doc.text
        setRevisionState(doc.revision)
    }, [])

    return {
        text,
        revision,
        setText,
        setRevision,
        applyRemoteOperation,
        initialize,
    }
}
