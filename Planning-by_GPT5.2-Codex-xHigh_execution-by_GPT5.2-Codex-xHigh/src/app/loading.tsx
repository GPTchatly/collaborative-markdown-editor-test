export default function Loading() {
  return (
    <div className="flex h-screen flex-col bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="h-4 w-48 animate-pulse rounded bg-[var(--bg-tertiary)]" />
        <div className="h-8 w-32 animate-pulse rounded bg-[var(--bg-tertiary)]" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row">
        <div className="flex-1 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
        <div className="flex-1 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
      </div>
      <div className="h-6 border-t border-[var(--border)]" />
    </div>
  )
}
