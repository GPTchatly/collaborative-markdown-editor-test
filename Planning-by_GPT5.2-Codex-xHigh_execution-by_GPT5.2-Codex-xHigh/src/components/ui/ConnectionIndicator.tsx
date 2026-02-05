'use client'

import type { ConnectionStatus } from '@/types/events'

const statusMap: Record<ConnectionStatus, { label: string; color: string }> = {
  connected: { label: 'Live', color: 'bg-[var(--success)]' },
  connecting: { label: 'Connecting', color: 'bg-[var(--warning)]' },
  disconnected: { label: 'Offline', color: 'bg-[var(--error)]' },
  syncing: { label: 'Syncing', color: 'bg-[var(--accent-blue)]' },
}

export function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const config = statusMap[status]

  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-secondary)]">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      <span>{config.label}</span>
    </div>
  )
}
