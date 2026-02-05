import type { Document, HistoryItem } from '@/types/document'
import type { Operation } from '@/types/operations'

/**
 * In-memory document store (singleton)
 */
class DocumentStore {
  private static instance: DocumentStore
  private document: Document = {
    text: '# Welcome to Collaborative Markdown Editor\n\nStart typing here...',
    revision: 0,
  }
  private history: HistoryItem[] = []

  private constructor() {}

  public static getInstance(): DocumentStore {
    if (!DocumentStore.instance) {
      DocumentStore.instance = new DocumentStore()
    }
    return DocumentStore.instance
  }

  public getDocument(): Document {
    return { ...this.document }
  }

  public getRevision(): number {
    return this.document.revision
  }

  public applyOperation(op: Operation, clientId: string): number {
    const newText = this.applyToText(this.document.text, op)
    this.document.text = newText
    this.document.revision++

    this.history.push({
      op,
      clientId,
      timestamp: Date.now(),
      revision: this.document.revision,
    })

    return this.document.revision
  }

  public getHistorySince(revision: number): HistoryItem[] {
    return this.history.filter((item) => item.revision > revision)
  }

  private applyToText(text: string, op: Operation): string {
    if (op.type === 'insert') {
      return text.slice(0, op.index) + op.text + text.slice(op.index)
    } else {
      return text.slice(0, op.index) + text.slice(op.index + op.length)
    }
  }
}

export const documentStore = DocumentStore.getInstance()
