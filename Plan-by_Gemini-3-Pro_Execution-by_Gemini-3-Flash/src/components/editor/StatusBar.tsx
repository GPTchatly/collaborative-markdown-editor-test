'use client'

import type { ConnectionStatus } from '@/types/events'
import { cn } from '@/lib/utils/cn'

interface StatusBarProps {
  status: ConnectionStatus
  revision: number
}

const statusConfig = {
  connected: { label: 'Connected', color: 'bg-green-500' },
  connecting: { label: 'Connecting...', color: 'bg-yellow-500' },
  disconnected: { label: 'Disconnected', color: 'bg-red-500' },
  syncing: { label: 'Syncing...', color: 'bg-blue-500' },
} as const

export function StatusBar({ status, revision }: StatusBarProps) {
  const config = statusConfig[status]

  return (
    <div className="flex h-6 items-center justify-between border-t border-[#3c3c3c] bg-[#007acc] px-3 text-[11px] text-white">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={cn('h-2.5 w-2.5 rounded-full border border-white/20', config.color)} />
          <span className="font-medium">{config.label}</span>
        </div>
        <div className="h-3 w-px bg-white/20" />
        <span className="opacity-80">UTF-8</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Revision: {revision}</span>
        <span className="opacity-80">Markdown</span>
      </div>
    </div>
  )
}
