export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-sm">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[var(--accent-green)]" />
        Loading editor...
      </div>
    </div>
  )
}
