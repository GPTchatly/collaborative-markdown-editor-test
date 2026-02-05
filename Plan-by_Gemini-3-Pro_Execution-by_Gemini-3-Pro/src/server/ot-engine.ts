import type { OperationMessage } from '@/types/operations'
import type { Operation } from '@/types/operations'
import { getHistorySince, applyOperationToStore } from './document-store'
import { transform } from '@/lib/ot/transform'

export interface ProcessResult {
  revision: number
  applied: boolean
  appliedOp?: Operation
  transformedOp?: Operation
}

export function processOperation(message: OperationMessage): ProcessResult {
  const history = getHistorySince(message.revision)
  let transformed: Operation | null = message.op

  for (const entry of history) {
    if (!transformed) {
      break
    }
    transformed = transform(transformed, entry.op)
  }

  if (!transformed) {
    return { revision: history.at(-1)?.revision ?? message.revision, applied: false }
  }

  const applied = applyOperationToStore(transformed, message.clientId)
  const changed = !isSameOperation(message.op, transformed)

  return {
    revision: applied.revision,
    applied: true,
    appliedOp: transformed,
    transformedOp: changed ? transformed : undefined,
  }
}

function isSameOperation(a: Operation, b: Operation) {
  if (a.type !== b.type) {
    return false
  }

  if (a.type === 'insert' && b.type === 'insert') {
    return a.index === b.index && a.text === b.text
  }

  if (a.type === 'delete' && b.type === 'delete') {
    return a.index === b.index && a.length === b.length
  }

  return false
}
