/**
 * Editor shell component (Server Component).
 * Fetches initial document state and renders the client editor.
 */

import { EditorClient } from './EditorClient'
import { getDocument } from '@/server/document-store'

/**
 * Server Component wrapper for the editor.
 * Fetches initial document state server-side.
 */
export async function EditorShell() {
    // Get initial document state server-side
    const initialDocument = getDocument()

    return (
        <div className="flex h-full flex-col bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)] px-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <svg
                            className="h-5 w-5 text-[var(--accent-blue)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                        <h1 className="text-sm font-medium text-[var(--text-primary)]">
                            Collaborative Markdown Editor
                        </h1>
                    </div>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                    Open in another window to test collaboration
                </div>
            </header>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                <EditorClient initialDocument={initialDocument} />
            </div>
        </div>
    )
}
