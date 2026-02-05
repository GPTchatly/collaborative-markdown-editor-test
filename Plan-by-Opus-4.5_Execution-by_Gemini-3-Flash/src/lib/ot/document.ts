import type { Document, DocumentWithHistory, OperationRecord } from '@/types/document'
import type { Operation, OperationMessage } from '@/types/operations'
import { applyOperation } from './operations'
import { transformAgainstHistory } from './transform'

/**
 * Creates a new document with history tracking
 */
export function createDocument(initialText = ''): DocumentWithHistory {
  return {
    text: initialText,
    revision: 0,
    operations: [],
    clients: new Map(),
  }
}

/**
 * Applies an operation to the document, handling OT if needed
 * Returns the (possibly transformed) operation and new document state
 */
export function processOperation(
  doc: DocumentWithHistory,
  message: OperationMessage,
): { doc: DocumentWithHistory; appliedOp: Operation } {
  const { op, clientId, revision } = message

  // Get operations that happened after client's known revision
  const concurrentOps = doc.operations
    .filter((record) => record.revision > revision)
    .map((record) => record.op)

  // Transform incoming operation against concurrent operations
  const transformedOp = concurrentOps.length > 0 ? transformAgainstHistory(op, concurrentOps) : op

  // Apply transformed operation to document
  const newText = applyOperation(doc.text, transformedOp)
  const newRevision = doc.revision + 1

  // Record operation in history
  const record: OperationRecord = {
    op: transformedOp,
    clientId,
    revision: newRevision,
    timestamp: Date.now(),
  }

  return {
    doc: {
      ...doc,
      text: newText,
      revision: newRevision,
      operations: [...doc.operations, record],
    },
    appliedOp: transformedOp,
  }
}

/**
 * Gets document without history (for client consumption)
 */
export function getDocumentSnapshot(doc: DocumentWithHistory): Document {
  return {
    text: doc.text,
    revision: doc.revision,
  }
}
