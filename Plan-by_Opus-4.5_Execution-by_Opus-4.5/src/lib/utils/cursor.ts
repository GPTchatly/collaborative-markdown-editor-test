/**
 * Cursor position preservation utilities.
 * Handles cursor position adjustments during collaborative editing.
 */

import type { Operation } from '@/types/operations'

/**
 * Adjusts cursor position after an operation is applied.
 * @param cursorPosition - Current cursor position
 * @param op - The operation that was applied
 * @returns New cursor position after the operation
 */
export function adjustCursorForOperation(cursorPosition: number, op: Operation): number {
    if (op.type === 'insert') {
        // If insertion is before or at cursor, shift cursor right
        if (op.index <= cursorPosition) {
            return cursorPosition + op.text.length
        }
    } else if (op.type === 'delete') {
        const deleteEnd = op.index + op.length
        // If deletion is entirely before cursor, shift cursor left
        if (deleteEnd <= cursorPosition) {
            return cursorPosition - op.length
        }
        // If deletion starts before cursor but ends after, cursor moves to start of deletion
        if (op.index < cursorPosition) {
            return op.index
        }
    }
    return cursorPosition
}

/**
 * Calculates operations needed to preserve cursor position during text replacement.
 * @param oldText - Original text
 * @param newText - New text after edit
 * @param cursorPosition - Cursor position in the new text
 * @returns Object with the operation and adjusted cursor position
 */
export function calculateCursorPreservation(
    oldText: string,
    newText: string,
    cursorPosition: number,
): { operation: Operation | null; cursorOffset: number } {
    // Find the common prefix
    let prefixEnd = 0
    while (
        prefixEnd < oldText.length &&
        prefixEnd < newText.length &&
        oldText[prefixEnd] === newText[prefixEnd]
    ) {
        prefixEnd++
    }

    // Find the common suffix (from the end)
    let oldSuffixStart = oldText.length
    let newSuffixStart = newText.length
    while (
        oldSuffixStart > prefixEnd &&
        newSuffixStart > prefixEnd &&
        oldText[oldSuffixStart - 1] === newText[newSuffixStart - 1]
    ) {
        oldSuffixStart--
        newSuffixStart--
    }

    const deletedLength = oldSuffixStart - prefixEnd
    const insertedText = newText.slice(prefixEnd, newSuffixStart)

    // Determine the operation
    if (deletedLength > 0 && insertedText.length > 0) {
        // This is a replacement - we'll return just the delete for simplicity
        // In a full implementation, you'd handle this as two operations
        return {
            operation: { type: 'delete', index: prefixEnd, length: deletedLength },
            cursorOffset: cursorPosition,
        }
    } else if (deletedLength > 0) {
        return {
            operation: { type: 'delete', index: prefixEnd, length: deletedLength },
            cursorOffset: cursorPosition,
        }
    } else if (insertedText.length > 0) {
        return {
            operation: { type: 'insert', index: prefixEnd, text: insertedText },
            cursorOffset: cursorPosition,
        }
    }

    return { operation: null, cursorOffset: cursorPosition }
}
