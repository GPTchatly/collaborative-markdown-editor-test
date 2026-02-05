import type { Operation, InsertOp, DeleteOp } from '@/types/operations'
import { isInsertOp, isDeleteOp, createInsert, createDelete } from './operations'

/**
 * Transforms operation A against operation B
 * Returns A' such that applying B then A' = applying A then B'
 *
 * @param opA - The operation to transform
 * @param opB - The operation that was applied concurrently
 * @returns The transformed operation A'
 */
export function transform(opA: Operation, opB: Operation): Operation {
  if (isInsertOp(opA) && isInsertOp(opB)) {
    return transformInsertInsert(opA, opB)
  }

  if (isInsertOp(opA) && isDeleteOp(opB)) {
    return transformInsertDelete(opA, opB)
  }

  if (isDeleteOp(opA) && isInsertOp(opB)) {
    return transformDeleteInsert(opA, opB)
  }

  if (isDeleteOp(opA) && isDeleteOp(opB)) {
    return transformDeleteDelete(opA, opB)
  }

  return opA
}

/**
 * Insert vs Insert transformation
 * If positions equal, A wins (or use client ID for tie-breaking)
 */
function transformInsertInsert(opA: InsertOp, opB: InsertOp): InsertOp {
  if (opA.index <= opB.index) {
    // A's insert is before or at B's position, no change needed
    return opA
  }
  // A's insert is after B's insert, shift by B's length
  return createInsert(opA.index + opB.text.length, opA.text)
}

/**
 * Insert vs Delete transformation
 */
function transformInsertDelete(opA: InsertOp, opB: DeleteOp): InsertOp {
  if (opA.index <= opB.index) {
    // Insert before delete, no change
    return opA
  }

  if (opA.index >= opB.index + opB.length) {
    // Insert after deleted region, shift back
    return createInsert(opA.index - opB.length, opA.text)
  }

  // Insert within deleted region, move to delete start
  return createInsert(opB.index, opA.text)
}

/**
 * Delete vs Insert transformation
 */
function transformDeleteInsert(opA: DeleteOp, opB: InsertOp): DeleteOp {
  if (opA.index + opA.length <= opB.index) {
    // Delete entirely before insert, no change
    return opA
  }

  if (opA.index >= opB.index) {
    // Delete starts at or after insert, shift forward
    return createDelete(opA.index + opB.text.length, opA.length)
  }

  // Delete spans across insert point - delete in two parts conceptually
  // Simplified: expand delete to include inserted text effect
  // This preserves intent but may need refinement for production
  return createDelete(opA.index, opA.length)
}

/**
 * Delete vs Delete transformation
 */
function transformDeleteDelete(opA: DeleteOp, opB: DeleteOp): DeleteOp {
  // No overlap: A entirely before B
  if (opA.index + opA.length <= opB.index) {
    return opA
  }

  // No overlap: A entirely after B
  if (opA.index >= opB.index + opB.length) {
    return createDelete(opA.index - opB.length, opA.length)
  }

  // Overlap cases
  if (opA.index >= opB.index && opA.index + opA.length <= opB.index + opB.length) {
    // A is entirely within B - nothing left to delete
    return createDelete(opB.index, 0)
  }

  if (opA.index <= opB.index && opA.index + opA.length >= opB.index + opB.length) {
    // B is entirely within A - reduce A's length
    return createDelete(opA.index, opA.length - opB.length)
  }

  // Partial overlaps
  if (opA.index < opB.index) {
    // A starts before B, partial overlap
    const newLength = opB.index - opA.index
    return createDelete(opA.index, newLength)
  }

  // A starts within B
  const newIndex = opB.index
  const overlap = opB.index + opB.length - opA.index
  const newLength = Math.max(0, opA.length - overlap)
  return createDelete(newIndex, newLength)
}

/**
 * Transforms an operation against a series of operations
 */
export function transformAgainstHistory(op: Operation, history: Operation[]): Operation {
  let transformed = op
  for (const historyOp of history) {
    transformed = transform(transformed, historyOp)
  }
  return transformed
}
