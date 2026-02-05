import type { Operation } from '@/types/operations'

/**
 * Generates an OT operation based on the difference between old and new text.
 * This is a simplified diffing algorithm for demonstration.
 */
export function generateOperation(oldText: string, newText: string, cursorPos: number): Operation {
  if (newText.length > oldText.length) {
    // Insertion
    const addedLength = newText.length - oldText.length
    const addedText = newText.slice(cursorPos - addedLength, cursorPos)
    return {
      type: 'insert',
      index: cursorPos - addedLength,
      text: addedText,
    }
  } else {
    // Deletion
    const deletedLength = oldText.length - newText.length
    return {
      type: 'delete',
      index: cursorPos,
      length: deletedLength,
    }
  }
}

/**
 * Applies an operation to a text string.
 */
export function applyOperation(text: string, op: Operation): string {
  if (op.type === 'insert') {
    return text.slice(0, op.index) + op.text + text.slice(op.index)
  } else {
    return text.slice(0, op.index) + text.slice(op.index + op.length)
  }
}
