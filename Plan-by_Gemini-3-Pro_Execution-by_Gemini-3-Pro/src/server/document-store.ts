import type { DocumentOperation, DocumentSnapshot } from '@/types/document'
import type { Operation } from '@/types/operations'
import { applyOperation } from '@/lib/ot/operations'

interface DocumentStore {
  text: string
  revision: number
  history: DocumentOperation[]
  clients: Map<string, { lastSeen: number }>
}

const globalForStore = globalThis as unknown as { __documentStore?: DocumentStore }

function createStore(): DocumentStore {
  return {
    text: '# Welcome to the Collaborative Markdown Editor\n\nStart typing to collaborate in real time.',
    revision: 0,
    history: [],
    clients: new Map(),
  }
}

function getStore(): DocumentStore {
  if (!globalForStore.__documentStore) {
    globalForStore.__documentStore = createStore()
  }
  return globalForStore.__documentStore
}

export function getDocument(): DocumentSnapshot {
  const store = getStore()
  return { text: store.text, revision: store.revision }
}

export function recordClient(clientId: string) {
  const store = getStore()
  store.clients.set(clientId, { lastSeen: Date.now() })
}

export function removeClient(clientId: string) {
  const store = getStore()
  store.clients.delete(clientId)
}

export function getHistorySince(revision: number) {
  const store = getStore()
  return store.history.filter((entry) => entry.revision > revision)
}

export function applyOperationToStore(op: Operation, clientId: string): DocumentOperation {
  const store = getStore()
  store.text = applyOperation(store.text, op)
  store.revision += 1

  const entry: DocumentOperation = {
    op,
    clientId,
    revision: store.revision,
    timestamp: Date.now(),
  }

  store.history.push(entry)

  if (store.history.length > 2000) {
    store.history = store.history.slice(-1000)
  }

  recordClient(clientId)

  return entry
}
