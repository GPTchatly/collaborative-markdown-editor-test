'use client'

interface ToolbarProps {
  onCopy: () => void
  onDownload: () => void
  onClear: () => void
}

export function Toolbar({ onCopy, onDownload, onClear }: ToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onCopy}
        className="rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-primary)] transition hover:border-[var(--accent-blue)]"
      >
        Copy
      </button>
      <button
        type="button"
        onClick={onDownload}
        className="rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-primary)] transition hover:border-[var(--accent-green)]"
      >
        Export
      </button>
      <button
        type="button"
        onClick={onClear}
        className="rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-primary)] transition hover:border-[var(--error)]"
      >
        Clear
      </button>
    </div>
  )
}
