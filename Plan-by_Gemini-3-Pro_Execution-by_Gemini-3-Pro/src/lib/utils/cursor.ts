import type { Operation } from '@/types/operations'

export function transformCursor(cursor: number, op: Operation): number {
  if (op.type === 'insert') {
    if (op.index <= cursor) {
      return cursor + op.text.length
    }
    return cursor
  }

  if (op.index < cursor) {
    const removed = Math.min(op.length, cursor - op.index)
    return Math.max(op.index, cursor - removed)
  }

  return cursor
}
