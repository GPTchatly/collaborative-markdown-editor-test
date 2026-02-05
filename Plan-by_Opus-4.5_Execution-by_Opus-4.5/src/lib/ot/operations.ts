/**
 * Operational Transformation operations module.
 * Provides functions to generate, apply, and compose operations.
 */

import type { Operation, InsertOp, DeleteOp } from '@/types/operations'

/**
 * Generates an operation by diffing old and new text.
 * This is a simplified implementation that detects a single change.
 *
 * @param oldText - The original text
 * @param newText - The text after the edit
 * @param cursorPosition - Current cursor position (helps identify change location)
 * @returns The operation representing the change, or null if texts are identical
 */
export function generateOperation(
    oldText: string,
    newText: string,
    cursorPosition: number,
): Operation | null {
    if (oldText === newText) {
        return null
    }

    // Find common prefix
    let prefixEnd = 0
    const minLen = Math.min(oldText.length, newText.length)
    while (prefixEnd < minLen && oldText[prefixEnd] === newText[prefixEnd]) {
        prefixEnd++
    }

    // Find common suffix
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

    // Prioritize based on cursor position and actual changes
    if (deletedLength > 0 && insertedText.length === 0) {
        // Pure deletion
        return {
            type: 'delete',
            index: prefixEnd,
            length: deletedLength,
        } satisfies DeleteOp
    } else if (deletedLength === 0 && insertedText.length > 0) {
        // Pure insertion
        return {
            type: 'insert',
            index: prefixEnd,
            text: insertedText,
        } satisfies InsertOp
    } else if (deletedLength > 0 && insertedText.length > 0) {
        // Replacement - choose based on cursor position
        // If cursor is near the edit position, treat as replacement
        // For simplicity, we'll return the operation that happens first (delete)
        // A full implementation would handle this as a composite operation
        if (cursorPosition <= prefixEnd + deletedLength) {
            return {
                type: 'delete',
                index: prefixEnd,
                length: deletedLength,
            } satisfies DeleteOp
        } else {
            return {
                type: 'insert',
                index: prefixEnd,
                text: insertedText,
            } satisfies InsertOp
        }
    }

    return null
}

/**
 * Applies an operation to a text string.
 *
 * @param text - The original text
 * @param op - The operation to apply
 * @returns The text after applying the operation
 * @throws Error if the operation is invalid for the given text
 */
export function applyOperation(text: string, op: Operation): string {
    if (op.type === 'insert') {
        if (op.index < 0 || op.index > text.length) {
            throw new Error(`Insert index ${op.index} out of bounds for text of length ${text.length}`)
        }
        return text.slice(0, op.index) + op.text + text.slice(op.index)
    } else {
        const end = op.index + op.length
        if (op.index < 0 || end > text.length) {
            throw new Error(`Delete range [${op.index}, ${end}) out of bounds for text of length ${text.length}`)
        }
        return text.slice(0, op.index) + text.slice(end)
    }
}

/**
 * Composes two operations that should be applied sequentially.
 * Note: This is a simplified implementation that may not handle all edge cases.
 *
 * @param op1 - First operation (applied first)
 * @param op2 - Second operation (applied after op1)
 * @returns Array of composed operations (may be 1 or 2 operations)
 */
export function composeOperations(op1: Operation, op2: Operation): Operation[] {
    // For now, just return both operations in sequence
    // A full implementation would try to merge compatible operations
    return [op1, op2]
}

/**
 * Creates an insert operation.
 */
export function createInsert(index: number, text: string): InsertOp {
    return { type: 'insert', index, text }
}

/**
 * Creates a delete operation.
 */
export function createDelete(index: number, length: number): DeleteOp {
    return { type: 'delete', index, length }
}
