export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent-blue)]" />
        <p className="text-sm text-[var(--text-secondary)]">Loading editor...</p>
      </div>
    </div>
  )
}
