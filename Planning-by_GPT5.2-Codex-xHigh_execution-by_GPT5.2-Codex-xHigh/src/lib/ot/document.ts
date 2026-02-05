import type { Document } from '@/types/document'
import type { Operation } from '@/types/operations'
import { applyOperation } from './operations'

export function applyToDocument(doc: Document, op: Operation): Document {
  return {
    text: applyOperation(doc.text, op),
    revision: doc.revision + 1,
  }
}
