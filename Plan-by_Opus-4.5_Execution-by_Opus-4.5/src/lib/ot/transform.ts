/**
 * Operational Transformation core transform logic.
 * Implements the OT algorithm for concurrent edit conflict resolution.
 */

import type { Operation, InsertOp, DeleteOp } from '@/types/operations'

/**
 * Transforms op1 against op2 such that if op2 has already been applied,
 * the transformed op1 can be applied to achieve the same result.
 *
 * This follows the transformation property:
 * apply(apply(doc, op1), transform(op2, op1)) == apply(apply(doc, op2), transform(op1, op2))
 *
 * @param op1 - The operation to transform
 * @param op2 - The operation that has already been applied
 * @returns The transformed version of op1
 */
export function transform(op1: Operation, op2: Operation): Operation {
    if (op1.type === 'insert' && op2.type === 'insert') {
        return transformInsertInsert(op1, op2)
    } else if (op1.type === 'insert' && op2.type === 'delete') {
        return transformInsertDelete(op1, op2)
    } else if (op1.type === 'delete' && op2.type === 'insert') {
        return transformDeleteInsert(op1, op2)
    } else {
        return transformDeleteDelete(op1 as DeleteOp, op2 as DeleteOp)
    }
}

/**
 * Transform insert against insert.
 * If both insertions are at the same position, we need a tiebreaker.
 * Convention: use text content comparison for deterministic ordering.
 */
function transformInsertInsert(op1: InsertOp, op2: InsertOp): InsertOp {
    if (op1.index < op2.index) {
        // op1 inserts before op2, no change needed
        return { ...op1 }
    } else if (op1.index > op2.index) {
        // op2 inserted before op1, shift op1 right
        return {
            ...op1,
            index: op1.index + op2.text.length,
        }
    } else {
        // Same position - use text comparison as tiebreaker
        // If op1's text comes before op2's alphabetically, op1 wins position
        if (op1.text <= op2.text) {
            return { ...op1 }
        } else {
            return {
                ...op1,
                index: op1.index + op2.text.length,
            }
        }
    }
}

/**
 * Transform insert against delete.
 */
function transformInsertDelete(op1: InsertOp, op2: DeleteOp): InsertOp {
    const deleteEnd = op2.index + op2.length

    if (op1.index <= op2.index) {
        // Insert is before or at delete start, no change needed
        return { ...op1 }
    } else if (op1.index >= deleteEnd) {
        // Insert is after delete, shift left by deleted length
        return {
            ...op1,
            index: op1.index - op2.length,
        }
    } else {
        // Insert is within deleted region, move to delete start
        return {
            ...op1,
            index: op2.index,
        }
    }
}

/**
 * Transform delete against insert.
 */
function transformDeleteInsert(op1: DeleteOp, op2: InsertOp): DeleteOp {
    const deleteEnd = op1.index + op1.length

    if (deleteEnd <= op2.index) {
        // Delete is entirely before insert, no change needed
        return { ...op1 }
    } else if (op1.index >= op2.index) {
        // Delete starts at or after insert, shift right
        return {
            ...op1,
            index: op1.index + op2.text.length,
        }
    } else {
        // Insert is within delete range
        // The delete now spans across the inserted text
        return {
            ...op1,
            length: op1.length + op2.text.length,
        }
    }
}

/**
 * Transform delete against delete.
 * This is the most complex case as we need to handle overlapping deletions.
 */
function transformDeleteDelete(op1: DeleteOp, op2: DeleteOp): DeleteOp {
    const op1End = op1.index + op1.length
    const op2End = op2.index + op2.length

    if (op1End <= op2.index) {
        // op1 is entirely before op2, no change needed
        return { ...op1 }
    } else if (op1.index >= op2End) {
        // op1 is entirely after op2, shift left by op2's length
        return {
            ...op1,
            index: op1.index - op2.length,
        }
    } else if (op1.index >= op2.index && op1End <= op2End) {
        // op1 is entirely contained within op2, it becomes a no-op
        return {
            type: 'delete',
            index: op2.index,
            length: 0,
        }
    } else if (op1.index <= op2.index && op1End >= op2End) {
        // op1 contains op2 entirely, reduce op1's length
        return {
            ...op1,
            length: op1.length - op2.length,
        }
    } else if (op1.index < op2.index && op1End > op2.index && op1End <= op2End) {
        // op1 overlaps with the start of op2
        // op1 deletes some chars, then op2 already deleted the rest
        return {
            ...op1,
            length: op2.index - op1.index,
        }
    } else {
        // op1 overlaps with the end of op2 (op1.index >= op2.index && op1.index < op2End)
        // Adjust start and length
        const overlapStart = Math.max(op1.index, op2.index)
        const overlapEnd = Math.min(op1End, op2End)
        const overlapLength = overlapEnd - overlapStart
        return {
            type: 'delete',
            index: op2.index,
            length: op1.length - overlapLength,
        }
    }
}

/**
 * Transforms an array of operations against another operation.
 *
 * @param operations - Array of operations to transform
 * @param against - The operation to transform against
 * @returns Array of transformed operations
 */
export function transformAll(operations: Operation[], against: Operation): Operation[] {
    return operations.map((op) => transform(op, against))
}
