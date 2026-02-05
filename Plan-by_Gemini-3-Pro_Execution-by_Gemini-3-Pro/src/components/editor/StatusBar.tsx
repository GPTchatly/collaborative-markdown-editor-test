'use client'

import type { ConnectionStatus } from '@/types/events'

interface StatusBarProps {
  status: ConnectionStatus
  revision: number
}

const statusConfig: Record<ConnectionStatus, { label: string; color: string }> = {
  connected: { label: 'Connected', color: 'bg-green-500' },
  connecting: { label: 'Connecting...', color: 'bg-yellow-500' },
  disconnected: { label: 'Disconnected', color: 'bg-red-500' },
  syncing: { label: 'Syncing...', color: 'bg-blue-500' },
}

export function StatusBar({ status, revision }: StatusBarProps) {
  const config = statusConfig[status]

  return (
    <div className="flex h-7 items-center justify-between border-t border-[var(--border)] bg-[var(--accent-blue)] px-4 text-xs text-white">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${config.color}`} />
        <span>{config.label}</span>
      </div>
      <span>Rev: {revision}</span>
    </div>
  )
}
