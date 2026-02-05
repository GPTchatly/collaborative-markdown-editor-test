import type { DocumentWithHistory } from '@/types/document'
import { createDocument, getDocumentSnapshot, processOperation } from '@/lib/ot/document'
import type { OperationMessage } from '@/types/operations'

/**
 * Singleton document store for server-side state
 * In production, replace with Redis/database
 */
let document: DocumentWithHistory = createDocument(
  `# Welcome to the Collaborative Markdown Editor

Start typing to see your markdown rendered in real-time.

## Features

- **Real-time collaboration** via Operational Transformation
- **Live preview** of your markdown
- **Syntax highlighting** for code blocks

\`\`\`javascript
const greeting = 'Hello, World!'
console.log(greeting)
\`\`\`

> This editor syncs changes instantly across all connected clients.

Happy writing! ✨
`,
)

export function getDocument() {
  return getDocumentSnapshot(document)
}

export function getDocumentWithHistory() {
  return document
}

export function applyOperation(message: OperationMessage) {
  const result = processOperation(document, message)
  document = result.doc
  return {
    revision: document.revision,
    appliedOp: result.appliedOp,
  }
}

export function resetDocument(text = '') {
  document = createDocument(text)
}
