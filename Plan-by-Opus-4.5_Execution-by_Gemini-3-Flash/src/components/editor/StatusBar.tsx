'use client'

import type { ConnectionStatus } from '@/types/events'

interface StatusBarProps {
  status: ConnectionStatus
  revision: number
  clientId?: string
}

const statusConfig = {
  connected: { label: 'Connected', color: 'bg-[var(--success)]' },
  connecting: { label: 'Connecting...', color: 'bg-[var(--warning)]' },
  disconnected: { label: 'Disconnected', color: 'bg-[var(--error)]' },
  syncing: { label: 'Syncing...', color: 'bg-[var(--accent-blue)]' },
} as const

export function StatusBar({ status, revision, clientId }: StatusBarProps) {
  const config = statusConfig[status]

  return (
    <div className="flex h-6 items-center justify-between border-t border-[var(--border)] bg-[var(--accent-blue)] px-3 text-xs text-white">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${config.color}`} />
        <span>{config.label}</span>
        {clientId && <span className="text-white/70">• ID: {clientId.slice(0, 8)}</span>}
      </div>
      <div className="flex items-center gap-3">
        <span>Revision: {revision}</span>
      </div>
    </div>
  )
}
