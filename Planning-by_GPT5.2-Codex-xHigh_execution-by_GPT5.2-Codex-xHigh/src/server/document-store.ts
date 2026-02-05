import type { Document, DocumentHistoryEntry } from '@/types/document'
import type { Operation } from '@/types/operations'
import { applyOperation } from '@/lib/ot/operations'

const DEFAULT_TEXT = `# Collaborative Markdown Editor

Type on the left, preview on the right.

## Quick syntax
- **Bold** and *italic*
- \`inline code\` and fenced blocks
- [Links](https://example.com)
- > Blockquotes

---

Start collaborating now.`

interface DocumentStore {
  text: string
  revision: number
  history: DocumentHistoryEntry[]
}

const MAX_HISTORY = 500

const globalForStore = globalThis as unknown as {
  __collabDocStore?: DocumentStore
}

const store: DocumentStore = globalForStore.__collabDocStore ?? {
  text: DEFAULT_TEXT,
  revision: 0,
  history: [],
}

if (!globalForStore.__collabDocStore) {
  globalForStore.__collabDocStore = store
}

export function getDocument(): Document {
  return {
    text: store.text,
    revision: store.revision,
  }
}

export function applyOperationToStore(op: Operation, clientId: string) {
  store.text = applyOperation(store.text, op)
  store.revision += 1
  store.history.push({
    revision: store.revision,
    op,
    clientId,
    timestamp: Date.now(),
  })

  if (store.history.length > MAX_HISTORY) {
    store.history.splice(0, store.history.length - MAX_HISTORY)
  }

  return {
    revision: store.revision,
  }
}

export function getHistorySince(revision: number): DocumentHistoryEntry[] {
  if (revision < 0) return []
  return store.history.filter((entry) => entry.revision > revision)
}
