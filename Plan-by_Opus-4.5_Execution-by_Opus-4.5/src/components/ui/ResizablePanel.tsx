'use client'

/**
 * Resizable panel component for split-pane layouts.
 */

import { useState, useRef, useCallback, type ReactNode, type MouseEvent } from 'react'
import { cn } from '@/lib/utils/cn'

export interface ResizablePanelProps {
    leftPanel: ReactNode
    rightPanel: ReactNode
    defaultRatio?: number
    minRatio?: number
    maxRatio?: number
    className?: string
}

/**
 * A horizontally resizable split panel component.
 */
export function ResizablePanel({
    leftPanel,
    rightPanel,
    defaultRatio = 0.5,
    minRatio = 0.2,
    maxRatio = 0.8,
    className,
}: ResizablePanelProps) {
    const [ratio, setRatio] = useState(defaultRatio)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDraggingRef = useRef(false)

    const handleMouseDown = useCallback((e: MouseEvent) => {
        e.preventDefault()
        isDraggingRef.current = true
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'

        const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
            if (!isDraggingRef.current || !containerRef.current) return

            const containerRect = containerRef.current.getBoundingClientRect()
            const newRatio = (moveEvent.clientX - containerRect.left) / containerRect.width

            setRatio(Math.max(minRatio, Math.min(maxRatio, newRatio)))
        }

        const handleMouseUp = () => {
            isDraggingRef.current = false
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }, [minRatio, maxRatio])

    return (
        <div
            ref={containerRef}
            className={cn('flex h-full flex-col md:flex-row', className)}
        >
            {/* Left panel */}
            <div
                className="h-1/2 overflow-hidden md:h-full"
                style={{ flex: `0 0 ${ratio * 100}%` }}
            >
                {leftPanel}
            </div>

            {/* Resize handle */}
            <div
                className="group hidden cursor-col-resize items-center justify-center bg-[var(--border)] transition-colors hover:bg-[var(--accent-blue)] md:flex"
                style={{ width: '4px' }}
                onMouseDown={handleMouseDown}
            >
                <div className="h-8 w-1 rounded-full bg-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            {/* Mobile divider */}
            <div className="h-px w-full bg-[var(--border)] md:hidden" />

            {/* Right panel */}
            <div className="h-1/2 flex-1 overflow-hidden md:h-full">
                {rightPanel}
            </div>
        </div>
    )
}
