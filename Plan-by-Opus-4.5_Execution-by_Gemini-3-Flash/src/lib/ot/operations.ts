import type { Operation, InsertOp, DeleteOp } from '@/types/operations'

/**
 * Type guard for InsertOp
 */
export function isInsertOp(op: Operation): op is InsertOp {
  return op.type === 'insert'
}

/**
 * Type guard for DeleteOp
 */
export function isDeleteOp(op: Operation): op is DeleteOp {
  return op.type === 'delete'
}

/**
 * Creates an insert operation
 */
export function createInsert(index: number, text: string): InsertOp {
  return { type: 'insert', index, text }
}

/**
 * Creates a delete operation
 */
export function createDelete(index: number, length: number): DeleteOp {
  return { type: 'delete', index, length }
}

/**
 * Generates an operation by diffing old and new text
 * Uses cursor position hint for accuracy
 */
export function generateOperation(
  oldText: string,
  newText: string,
  cursorPosition: number,
): Operation | null {
  if (oldText === newText) return null

  const lengthDiff = newText.length - oldText.length

  if (lengthDiff > 0) {
    // Insertion detected
    const insertIndex = Math.max(0, cursorPosition - lengthDiff)
    const insertedText = newText.slice(insertIndex, insertIndex + lengthDiff)
    return createInsert(insertIndex, insertedText)
  } else if (lengthDiff < 0) {
    // Deletion detected
    const deleteLength = Math.abs(lengthDiff)
    const deleteIndex = cursorPosition
    return createDelete(deleteIndex, deleteLength)
  }

  // Replacement - treat as delete + insert (simplified to single op)
  // Find differing region
  let start = 0
  while (start < oldText.length && oldText[start] === newText[start]) {
    start++
  }

  let oldEnd = oldText.length
  let newEnd = newText.length
  while (oldEnd > start && newEnd > start && oldText[oldEnd - 1] === newText[newEnd - 1]) {
    oldEnd--
    newEnd--
  }

  // For simplicity, return insert at change point
  return createInsert(start, newText.slice(start, newEnd))
}

/**
 * Applies an operation to text
 */
export function applyOperation(text: string, op: Operation): string {
  if (op.type === 'insert') {
    return text.slice(0, op.index) + op.text + text.slice(op.index)
  }

  if (op.type === 'delete') {
    return text.slice(0, op.index) + text.slice(op.index + op.length)
  }

  return text
}
