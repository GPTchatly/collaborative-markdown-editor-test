import type { Operation } from '@/types/operations'

export function applyOperation(text: string, op: Operation): string {
  const index = clamp(op.index, 0, text.length)

  if (op.type === 'insert') {
    return text.slice(0, index) + op.text + text.slice(index)
  }

  const end = clamp(index + op.length, 0, text.length)
  return text.slice(0, index) + text.slice(end)
}

export function applyOperations(text: string, ops: Operation[]): string {
  return ops.reduce((acc, op) => applyOperation(acc, op), text)
}

export function generateOperations(prev: string, next: string): Operation[] {
  if (prev === next) {
    return []
  }

  let start = 0
  while (start < prev.length && start < next.length && prev[start] === next[start]) {
    start += 1
  }

  let endPrev = prev.length - 1
  let endNext = next.length - 1
  while (endPrev >= start && endNext >= start && prev[endPrev] === next[endNext]) {
    endPrev -= 1
    endNext -= 1
  }

  const deleteLength = Math.max(0, endPrev - start + 1)
  const insertText = next.slice(start, endNext + 1)

  const ops: Operation[] = []

  if (deleteLength > 0) {
    ops.push({ type: 'delete', index: start, length: deleteLength })
  }

  if (insertText.length > 0) {
    ops.push({ type: 'insert', index: start, text: insertText })
  }

  return ops
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
