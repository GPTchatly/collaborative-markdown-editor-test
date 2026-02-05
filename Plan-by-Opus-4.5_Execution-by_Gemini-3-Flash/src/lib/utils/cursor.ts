import type { Operation } from '@/types/operations'

/**
 * Calculates new cursor position after applying an operation
 */
export function transformCursor(cursor: number, op: Operation): number {
  if (op.type === 'insert') {
    if (op.index <= cursor) {
      return cursor + op.text.length
    }
    return cursor
  }

  if (op.type === 'delete') {
    if (op.index + op.length <= cursor) {
      return cursor - op.length
    }
    if (op.index < cursor) {
      return op.index
    }
    return cursor
  }

  return cursor
}

/**
 * Gets cursor position from textarea element
 */
export function getCursorPosition(element: HTMLTextAreaElement): number {
  return element.selectionStart
}

/**
 * Sets cursor position in textarea element
 */
export function setCursorPosition(element: HTMLTextAreaElement, position: number): void {
  element.selectionStart = position
  element.selectionEnd = position
}
