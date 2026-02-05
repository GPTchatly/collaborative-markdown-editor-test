'use client'

/**
 * Status bar component.
 * Shows connection status and document revision.
 */

import type { ConnectionStatus } from '@/types/events'
import { ConnectionIndicator } from '@/components/ui/ConnectionIndicator'

export interface StatusBarProps {
    status: ConnectionStatus
    revision: number
}

/**
 * VS Code-style status bar.
 */
export function StatusBar({ status, revision }: StatusBarProps) {
    return (
        <footer className="flex h-6 shrink-0 items-center justify-between bg-[var(--statusbar-bg)] px-3 text-xs text-[var(--statusbar-text)]">
            {/* Left side - connection status */}
            <ConnectionIndicator status={status} showLabel />

            {/* Right side - document info */}
            <div className="flex items-center gap-4">
                <span className="opacity-80">
                    Rev: {revision}
                </span>
                <span className="opacity-80">Markdown</span>
                <span className="opacity-80">UTF-8</span>
            </div>
        </footer>
    )
}
