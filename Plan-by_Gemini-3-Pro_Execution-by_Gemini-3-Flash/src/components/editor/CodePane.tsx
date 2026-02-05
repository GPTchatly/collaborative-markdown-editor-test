'use client'

import { useCallback, type ChangeEvent } from 'react'
import { useCursorPreservation } from '@/hooks/use-cursor-preservation'

interface CodePaneProps {
  value: string
  onChange: (value: string, cursorPosition: number) => void
}

export function CodePane({ value, onChange }: CodePaneProps) {
  const { textareaRef } = useCursorPreservation()

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      const cursorPosition = e.target.selectionStart
      onChange(newValue, cursorPosition)
    },
    [onChange],
  )

  const lineCount = value.split('\n').length

  return (
    <div className="relative flex-1 overflow-hidden border-r border-[#3c3c3c] bg-[#1e1e1e]">
      {/* Line numbers overlay */}
      <div className="pointer-events-none absolute left-0 top-0 w-12 select-none py-4 text-right text-[12px] text-[#858585] font-mono leading-6">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className="h-full w-full resize-none bg-transparent pl-14 pr-4 py-4 font-mono text-[14px] leading-6 text-[#d4d4d4] outline-none"
        spellCheck={false}
        autoFocus
      />
    </div>
  )
}
