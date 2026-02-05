'use client'

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'

import { useCursorPreservation } from '@/hooks/use-cursor-preservation'

interface CodePaneProps {
  value: string
  cursorPosition: number
  onChange: (value: string, cursorPosition: number) => void
}

export function CodePane({ value, cursorPosition, onChange }: CodePaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { setCursor } = useCursorPreservation()
  const [scrollTop, setScrollTop] = useState(0)

  const lineNumbers = useMemo(() => {
    const count = value.split('\n').length
    return Array.from({ length: count }, (_, index) => index + 1)
  }, [value])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value
      const nextCursor = event.target.selectionStart
      setCursor(nextCursor)
      onChange(newValue, nextCursor)
    },
    [onChange, setCursor],
  )

  const handleScroll = useCallback(() => {
    setScrollTop(textareaRef.current?.scrollTop ?? 0)
  }, [])

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.selectionStart = cursorPosition
    textarea.selectionEnd = cursorPosition
  }, [cursorPosition, value])

  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--bg-primary)]">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-14 border-r border-[var(--border)] bg-[var(--bg-primary)] text-right text-[0.7rem] text-[var(--text-secondary)]">
        <div className="pt-4 leading-6" style={{ transform: `translateY(-${scrollTop}px)` }}>
          {lineNumbers.map((line) => (
            <div key={line} className="pr-3">
              {line}
            </div>
          ))}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        className="h-full w-full resize-none bg-transparent pl-16 pr-4 pt-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none"
        spellCheck={false}
      />
    </div>
  )
}
