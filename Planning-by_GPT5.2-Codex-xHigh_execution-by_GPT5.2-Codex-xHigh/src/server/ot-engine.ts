import type { OperationAck, OperationMessage } from '@/types/operations'
import { transform } from '@/lib/ot/transform'
import { applyOperationToStore, getDocument, getHistorySince } from './document-store'

export function processOperation(message: OperationMessage): OperationAck {
  const history = getHistorySince(message.revision)

  let incoming = message.op
  for (const entry of history) {
    const transformed = transform(incoming, entry.op, 'right')
    if (!transformed) {
      return {
        ack: true,
        revision: getDocument().revision,
        transformedOp: null,
      }
    }
    incoming = transformed
  }

  const result = applyOperationToStore(incoming, message.clientId)

  return {
    ack: true,
    revision: result.revision,
    transformedOp: incoming,
  }
}
