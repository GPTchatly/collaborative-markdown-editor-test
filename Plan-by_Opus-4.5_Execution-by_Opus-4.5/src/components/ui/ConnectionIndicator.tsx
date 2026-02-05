'use client'

/**
 * Connection status indicator component.
 * Shows a colored dot with animation based on connection state.
 */

import type { ConnectionStatus } from '@/types/events'
import { cn } from '@/lib/utils/cn'

export interface ConnectionIndicatorProps {
    status: ConnectionStatus
    showLabel?: boolean
    className?: string
}

const statusConfig: Record<ConnectionStatus, { label: string; colorClass: string; animate: boolean }> = {
    connected: {
        label: 'Connected',
        colorClass: 'bg-[var(--success)]',
        animate: false,
    },
    connecting: {
        label: 'Connecting...',
        colorClass: 'bg-[var(--warning)]',
        animate: true,
    },
    disconnected: {
        label: 'Disconnected',
        colorClass: 'bg-[var(--error)]',
        animate: false,
    },
    syncing: {
        label: 'Syncing...',
        colorClass: 'bg-[var(--info)]',
        animate: true,
    },
}

/**
 * Displays the current connection status with a colored indicator.
 */
export function ConnectionIndicator({
    status,
    showLabel = true,
    className,
}: ConnectionIndicatorProps) {
    const config = statusConfig[status]

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span
                className={cn(
                    'h-2 w-2 rounded-full',
                    config.colorClass,
                    config.animate && 'animate-pulse',
                )}
                aria-hidden="true"
            />
            {showLabel && (
                <span className="text-xs text-inherit">{config.label}</span>
            )}
        </div>
    )
}
