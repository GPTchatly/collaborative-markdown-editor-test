'use client'

import type { ConnectionStatus } from '@/types/events'

interface StatusBarProps {
  status: ConnectionStatus
  revision: number
}

const statusConfig: Record<ConnectionStatus, { label: string; color: string }> = {
  connected: { label: 'Connected', color: 'bg-[var(--success)]' },
  connecting: { label: 'Connecting...', color: 'bg-[var(--warning)]' },
  disconnected: { label: 'Disconnected', color: 'bg-[var(--error)]' },
  syncing: { label: 'Syncing...', color: 'bg-[var(--accent-blue)]' },
}

export function StatusBar({ status, revision }: StatusBarProps) {
  const config = statusConfig[status]

  return (
    <div className="flex h-7 items-center justify-between border-t border-[var(--border)] bg-[var(--accent-blue)] px-3 text-xs text-white">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${config.color}`} />
        <span>{config.label}</span>
      </div>
      <span className="tracking-[0.2em]">Rev {revision}</span>
    </div>
  )
}
