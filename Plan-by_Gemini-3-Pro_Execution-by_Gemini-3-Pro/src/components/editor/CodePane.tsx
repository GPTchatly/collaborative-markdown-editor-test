'use client'

import { useMemo, useRef, useCallback, type ChangeEvent } from 'react'
import { useCursorPreservation } from '@/hooks/use-cursor-preservation'

interface CodePaneProps {
  value: string
  cursorPosition: number
  onChange: (value: string, cursorPosition: number) => void
}

export function CodePane({ value, cursorPosition, onChange }: CodePaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useCursorPreservation(textareaRef, cursorPosition)

  const lineCount = useMemo(() => {
    return Math.max(1, value.split('\n').length)
  }, [value])

  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, index) => index + 1)
  }, [lineCount])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value
      const newCursor = event.target.selectionStart
      onChange(newValue, newCursor)
    },
    [onChange],
  )

  return (
    <div className="relative flex h-full flex-1 overflow-hidden border-r border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 select-none overflow-hidden bg-[var(--bg-primary)] py-4 text-right text-xs text-[var(--text-secondary)]">
        {lineNumbers.map((line) => (
          <div key={line} className="pr-2 leading-5">
            {line}
          </div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className="h-full w-full resize-none bg-transparent pl-14 pr-6 pt-4 text-sm leading-5 text-[var(--text-primary)] outline-none"
        spellCheck={false}
      />
    </div>
  )
}
