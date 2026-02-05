import { documentStore } from './document-store'
import { transform } from '@/lib/ot/transform'
import type { Operation, OperationMessage } from '@/types/operations'

/**
 * OT Engine processes incoming operations, transforms them against
 * concurrent operations in history, and applies them to the document.
 */
export class OTEngine {
  public static processOperation(message: OperationMessage): {
    revision: number
    transformedOp: Operation
  } {
    const { op, revision: clientRevision, clientId } = message
    const currentRevision = documentStore.getRevision()

    let transformedOp = { ...op }

    if (clientRevision < currentRevision) {
      // The client is behind, we need to transform their operation
      // against all operations that happened since their revision.
      const concurrentHistory = documentStore.getHistorySince(clientRevision)

      for (const historyItem of concurrentHistory) {
        if (historyItem.clientId !== clientId) {
          transformedOp = transform(transformedOp, historyItem.op)
        }
      }
    }

    const newRevision = documentStore.applyOperation(transformedOp, clientId)

    return {
      revision: newRevision,
      transformedOp,
    }
  }
}
