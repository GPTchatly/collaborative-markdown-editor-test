import type { Operation, InsertOp, DeleteOp } from '@/types/operations'

/**
 * Transforms an operation against another concurrent operation.
 *
 * @param op The operation to transform
 * @param against The operation to transform against
 * @returns The transformed operation
 */
export function transform(op: Operation, against: Operation): Operation {
  if (op.type === 'insert' && against.type === 'insert') {
    return transformInsertAgainstInsert(op, against)
  }
  if (op.type === 'insert' && against.type === 'delete') {
    return transformInsertAgainstDelete(op, against)
  }
  if (op.type === 'delete' && against.type === 'insert') {
    return transformDeleteAgainstInsert(op, against)
  }
  if (op.type === 'delete' && against.type === 'delete') {
    return transformDeleteAgainstDelete(op, against)
  }
  return op
}

function transformInsertAgainstInsert(op: InsertOp, against: InsertOp): InsertOp {
  if (op.index < against.index) {
    return op
  }
  // If indices are same, we use client priority (simplified or just move one)
  return {
    ...op,
    index: op.index + against.text.length,
  }
}

function transformInsertAgainstDelete(op: InsertOp, against: DeleteOp): InsertOp {
  if (op.index <= against.index) {
    return op
  }
  if (op.index >= against.index + against.length) {
    return {
      ...op,
      index: op.index - against.length,
    }
  }
  // If insert is inside delete, move it to the start of the deletion
  return {
    ...op,
    index: against.index,
  }
}

function transformDeleteAgainstInsert(op: DeleteOp, against: InsertOp): DeleteOp {
  if (op.index < against.index) {
    if (op.index + op.length <= against.index) {
      return op
    }
    // Deletion spans across insertion point
    return {
      ...op,
      length: op.length + against.text.length,
    }
  }
  return {
    ...op,
    index: op.index + against.text.length,
  }
}

function transformDeleteAgainstDelete(op: DeleteOp, against: DeleteOp): DeleteOp {
  if (op.index + op.length <= against.index) {
    return op
  }
  if (op.index >= against.index + against.length) {
    return {
      ...op,
      index: op.index - against.length,
    }
  }

  // Overlapping deletions
  const newStart = Math.min(op.index, against.index)
  const newEnd = Math.max(op.index + op.length, against.index + against.length)

  // This is a simplified version - in real OT it might be more complex
  // but for basic usage we just adjust the remaining part of the deletion
  if (op.index < against.index) {
    return {
      ...op,
      length: against.index - op.index,
    }
  } else {
    const deletedAfterAgainst = op.index + op.length - (against.index + against.length)
    if (deletedAfterAgainst <= 0) {
      return { ...op, length: 0 } // Already deleted
    }
    return {
      type: 'delete',
      index: against.index,
      length: deletedAfterAgainst,
    }
  }
}
