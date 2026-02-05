/**
 * In-memory document store singleton.
 * Maintains the authoritative document state on the server.
 *
 * Note: This is an in-memory store. Document state will be lost on server restart.
 * For production, you'd want to persist to a database.
 */

import { OTDocument } from '@/lib/ot/document'
import type { ClientInfo } from '@/types/document'

/**
 * Singleton document store instance.
 * Using module-level state for persistence across API route invocations.
 */
let documentInstance: OTDocument | null = null
const connectedClients = new Map<string, ClientInfo>()

// Initial markdown content for demonstration
const INITIAL_CONTENT = `# Welcome to the Collaborative Markdown Editor

Start typing to see your changes appear in the preview panel.

## Features

- **Real-time collaboration** — Multiple users can edit simultaneously
- **Live preview** — See your markdown rendered as you type
- **Syntax support** — Full markdown syntax including:
  - *Italic* and **bold** text
  - \`inline code\` and code blocks
  - Lists, blockquotes, and more

## Try it out!

Open this page in another browser window to test collaboration.

---

Happy writing! ✨
`

/**
 * Gets or creates the document instance.
 */
function getDocumentInstance(): OTDocument {
    if (!documentInstance) {
        documentInstance = new OTDocument(INITIAL_CONTENT)
    }
    return documentInstance
}

/**
 * Gets the current document state.
 */
export function getDocument(): { text: string; revision: number } {
    const doc = getDocumentInstance()
    return doc.snapshot()
}

/**
 * Gets the OT document instance for advanced operations.
 */
export function getOTDocument(): OTDocument {
    return getDocumentInstance()
}

/**
 * Registers a new client connection.
 */
export function registerClient(clientId: string): void {
    connectedClients.set(clientId, {
        id: clientId,
        cursorPosition: 0,
        lastSeen: new Date(),
    })
}

/**
 * Unregisters a client connection.
 */
export function unregisterClient(clientId: string): void {
    connectedClients.delete(clientId)
}

/**
 * Updates a client's cursor position.
 */
export function updateClientCursor(clientId: string, position: number): void {
    const client = connectedClients.get(clientId)
    if (client) {
        client.cursorPosition = position
        client.lastSeen = new Date()
    }
}

/**
 * Gets all connected clients.
 */
export function getConnectedClients(): Map<string, ClientInfo> {
    return new Map(connectedClients)
}

/**
 * Gets the count of connected clients.
 */
export function getClientCount(): number {
    return connectedClients.size
}

/**
 * Resets the document store (for testing purposes).
 */
export function resetDocumentStore(): void {
    documentInstance = null
    connectedClients.clear()
}
