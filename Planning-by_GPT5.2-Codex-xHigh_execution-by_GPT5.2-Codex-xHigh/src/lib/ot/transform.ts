import type { Operation } from '@/types/operations'

export type TransformPriority = 'left' | 'right'

export function transform(
  opA: Operation,
  opB: Operation,
  priority: TransformPriority,
): Operation | null {
  if (opA.type === 'insert' && opB.type === 'insert') {
    return transformInsertInsert(opA, opB, priority)
  } else if (opA.type === 'insert' && opB.type === 'delete') {
    return transformInsertDelete(opA, opB)
  } else if (opA.type === 'delete' && opB.type === 'insert') {
    return transformDeleteInsert(opA, opB)
  }

  if (opA.type === 'delete' && opB.type === 'delete') {
    return transformDeleteDelete(opA, opB)
  }

  return opA
}

export function transformPair(
  left: Operation,
  right: Operation,
  leftPriority: TransformPriority,
): [Operation | null, Operation | null] {
  const leftPrime = transform(left, right, leftPriority)
  const rightPrime = transform(right, left, leftPriority === 'left' ? 'right' : 'left')
  return [leftPrime, rightPrime]
}

function transformInsertInsert(
  left: Extract<Operation, { type: 'insert' }>,
  right: Extract<Operation, { type: 'insert' }>,
  priority: TransformPriority,
): Operation {
  if (left.index < right.index) {
    return left
  }

  if (left.index === right.index && priority === 'left') {
    return left
  }

  return { ...left, index: left.index + right.text.length }
}

function transformInsertDelete(
  insert: Extract<Operation, { type: 'insert' }>,
  del: Extract<Operation, { type: 'delete' }>,
): Operation {
  if (insert.index <= del.index) {
    return insert
  }

  const deleteEnd = del.index + del.length
  if (insert.index >= deleteEnd) {
    return { ...insert, index: insert.index - del.length }
  }

  return { ...insert, index: del.index }
}

function transformDeleteInsert(
  del: Extract<Operation, { type: 'delete' }>,
  insert: Extract<Operation, { type: 'insert' }>,
): Operation {
  if (insert.index <= del.index) {
    return { ...del, index: del.index + insert.text.length }
  }

  const deleteEnd = del.index + del.length
  if (insert.index >= deleteEnd) {
    return del
  }

  return { ...del, length: del.length + insert.text.length }
}

function transformDeleteDelete(
  left: Extract<Operation, { type: 'delete' }>,
  right: Extract<Operation, { type: 'delete' }>,
): Operation | null {
  const leftStart = left.index
  const leftEnd = left.index + left.length
  const rightStart = right.index
  const rightEnd = right.index + right.length

  if (leftEnd <= rightStart) {
    return left
  }

  if (leftStart >= rightEnd) {
    return { ...left, index: left.index - right.length }
  }

  const overlapStart = Math.max(leftStart, rightStart)
  const overlapEnd = Math.min(leftEnd, rightEnd)
  const overlap = Math.max(0, overlapEnd - overlapStart)

  const shift = Math.max(0, Math.min(leftStart, rightEnd) - rightStart)
  const nextIndex = left.index - shift
  const nextLength = left.length - overlap

  if (nextLength <= 0) {
    return null
  }

  return { ...left, index: nextIndex, length: nextLength }
}
