import type { Operation } from '@/types/operations'

export function applyOperation(text: string, op: Operation): string {
  if (op.type === 'insert') {
    const safeIndex = clampIndex(op.index, text.length)
    return text.slice(0, safeIndex) + op.text + text.slice(safeIndex)
  }

  const safeIndex = clampIndex(op.index, text.length)
  const safeLength = clampLength(op.length, text.length - safeIndex)
  return text.slice(0, safeIndex) + text.slice(safeIndex + safeLength)
}

export function applyOperations(text: string, ops: Operation[]): string {
  return ops.reduce((current, op) => applyOperation(current, op), text)
}

export function generateOperation(previous: string, next: string): Operation[] {
  if (previous === next) {
    return []
  }

  const start = commonPrefixLength(previous, next)
  const end = commonSuffixLength(previous, next, start)

  const deletedLength = previous.length - start - end
  const insertedText = next.slice(start, next.length - end)

  const ops: Operation[] = []

  if (deletedLength > 0) {
    ops.push({
      type: 'delete',
      index: start,
      length: deletedLength,
    })
  }

  if (insertedText.length > 0) {
    ops.push({
      type: 'insert',
      index: start,
      text: insertedText,
    })
  }

  return ops
}

export function isNoop(op: Operation): boolean {
  if (op.type === 'insert') {
    return op.text.length === 0
  }
  return op.length === 0
}

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length)
  let i = 0
  for (; i < max; i += 1) {
    if (a[i] !== b[i]) {
      break
    }
  }
  return i
}

function commonSuffixLength(a: string, b: string, prefixLength: number): number {
  const aMax = a.length - prefixLength
  const bMax = b.length - prefixLength
  const max = Math.min(aMax, bMax)
  let i = 0
  for (; i < max; i += 1) {
    if (a[a.length - 1 - i] !== b[b.length - 1 - i]) {
      break
    }
  }
  return i
}

function clampIndex(index: number, max: number): number {
  if (index < 0) return 0
  if (index > max) return max
  return index
}

function clampLength(length: number, max: number): number {
  if (length < 0) return 0
  if (length > max) return max
  return length
}
