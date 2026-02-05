import type { Operation } from '@/types/operations'

export function transformCursorPosition(cursor: number, op: Operation): number {
  if (op.type === 'insert') {
    if (op.index <= cursor) {
      return cursor + op.text.length
    }
    return cursor
  }

  if (cursor <= op.index) {
    return cursor
  }

  if (cursor >= op.index + op.length) {
    return cursor - op.length
  }

  return op.index
}
