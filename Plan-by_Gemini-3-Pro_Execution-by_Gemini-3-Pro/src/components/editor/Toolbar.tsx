'use client'

import { ConnectionIndicator } from '@/components/ui/ConnectionIndicator'

export function Toolbar() {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Collaborative Markdown</h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Draft, preview, and sync edits in real time.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ConnectionIndicator label="Live" />
        <button
          type="button"
          className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-blue)]"
        >
          Share
        </button>
      </div>
    </div>
  )
}
