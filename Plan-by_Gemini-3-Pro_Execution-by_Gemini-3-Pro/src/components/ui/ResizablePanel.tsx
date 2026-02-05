'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ResizablePanelProps {
  left: ReactNode
  right: ReactNode
}

export function ResizablePanel({ left, right }: ResizablePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [split, setSplit] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!isDragging) {
      return
    }

    const handleMove = (event: MouseEvent) => {
      const container = containerRef.current
      if (!container) {
        return
      }

      const rect = container.getBoundingClientRect()
      const nextSplit = ((event.clientX - rect.left) / rect.width) * 100
      setSplit(Math.min(70, Math.max(30, nextSplit)))
    }

    const handleUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging])

  return (
    <div ref={containerRef} className="flex flex-1 flex-col overflow-hidden md:flex-row">
      <div className="relative h-1/2 w-full md:h-full" style={{ width: `calc(${split}% - 6px)` }}>
        {left}
      </div>
      <button
        type="button"
        onMouseDown={() => setIsDragging(true)}
        className="group relative z-10 hidden w-3 cursor-col-resize items-center justify-center bg-[var(--bg-tertiary)] transition hover:bg-[var(--accent-blue)] md:flex"
        aria-label="Resize panels"
      >
        <span className="h-12 w-0.5 rounded-full bg-[var(--border)] transition group-hover:bg-white" />
      </button>
      <div
        className="relative h-1/2 w-full md:h-full"
        style={{ width: `calc(${100 - split}% - 6px)` }}
      >
        {right}
      </div>
    </div>
  )
}
