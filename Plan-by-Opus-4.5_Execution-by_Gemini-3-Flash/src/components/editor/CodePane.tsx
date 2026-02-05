'use client'

import { useRef, useCallback, type ChangeEvent } from 'react'
import { getCursorPosition } from '@/lib/utils/cursor'

interface CodePaneProps {
  value: string
  onChange: (value: string, cursorPosition: number) => void
}

export function CodePane({ value, onChange }: CodePaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      const cursorPosition = getCursorPosition(e.target)
      onChange(newValue, cursorPosition)
    },
    [onChange],
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.currentTarget
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue = target.value.substring(0, start) + '  ' + target.value.substring(end)
      target.value = newValue
      target.selectionStart = target.selectionEnd = start + 2

      // Trigger change event
      const event = new Event('input', { bubbles: true })
      target.dispatchEvent(event)
    }
  }, [])

  // Generate line numbers
  const lineCount = value.split('\n').length
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

  return (
    <div className="relative flex h-full flex-1 overflow-hidden border-r border-[var(--border)]">
      {/* Line numbers */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 w-12 select-none bg-[var(--bg-primary)] pr-2 pt-4 text-right font-mono text-sm leading-6 text-[var(--text-secondary)]">
        {lineNumbers.map((num) => (
          <div key={num}>{num}</div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="h-full w-full resize-none bg-[var(--bg-primary)] pl-14 pr-4 pt-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
        placeholder="Start typing your markdown..."
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  )
}
