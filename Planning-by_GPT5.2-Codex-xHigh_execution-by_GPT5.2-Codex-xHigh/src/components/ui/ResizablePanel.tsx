'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface ResizablePanelProps {
  left: React.ReactNode
  right: React.ReactNode
  minLeft?: number
  maxLeft?: number
  initialLeft?: number
}

export function ResizablePanel({
  left,
  right,
  minLeft = 280,
  maxLeft,
  initialLeft = 520,
}: ResizablePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [leftWidth, setLeftWidth] = useState(initialLeft)
  const [isDragging, setIsDragging] = useState(false)
  const [isStacked, setIsStacked] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const update = () => setIsStacked(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      if (isStacked) return
      event.preventDefault()
      setIsDragging(true)
    },
    [isStacked],
  )

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!isDragging || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const raw = event.clientX - rect.left
      const maxValue = maxLeft ?? Math.max(minLeft, rect.width - minLeft)
      const next = Math.min(Math.max(raw, minLeft), maxValue)
      setLeftWidth(next)
    }

    const handleUp = () => setIsDragging(false)

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [isDragging, maxLeft, minLeft])

  return (
    <div ref={containerRef} className={`flex h-full w-full ${isStacked ? 'flex-col' : 'flex-row'}`}>
      <div
        className={
          isStacked
            ? 'flex-1 border-b border-[var(--border)]'
            : 'h-full border-r border-[var(--border)]'
        }
        style={isStacked ? undefined : { width: leftWidth }}
      >
        {left}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={startDrag}
        className={
          isStacked
            ? 'hidden'
            : 'flex w-2 cursor-col-resize items-center justify-center bg-[var(--bg-tertiary)]'
        }
      >
        <div className="h-10 w-[2px] rounded-full bg-[var(--border)]" />
      </div>

      <div className="flex-1">{right}</div>
    </div>
  )
}
