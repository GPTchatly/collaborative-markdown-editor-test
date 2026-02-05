'use client'

interface ConnectionIndicatorProps {
  label: string
}

export function ConnectionIndicator({ label }: ConnectionIndicatorProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)]">
      <span className="h-2 w-2 rounded-full bg-[var(--accent-green)] shadow-[0_0_10px_rgba(78,201,176,0.8)]" />
      {label}
    </div>
  )
}
