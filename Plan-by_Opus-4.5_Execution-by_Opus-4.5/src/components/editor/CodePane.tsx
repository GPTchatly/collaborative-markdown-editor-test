'use client'

/**
 * Code pane component for markdown editing.
 * Styled textarea with line numbers.
 */

import { forwardRef, useCallback, useMemo, type ChangeEvent } from 'react'

export interface CodePaneProps {
    value: string
    onChange: (value: string, cursorPosition: number) => void
}

/**
 * Markdown code editor pane with line numbers.
 */
export const CodePane = forwardRef<HTMLTextAreaElement, CodePaneProps>(
    function CodePane({ value, onChange }, ref) {
        // Calculate line numbers
        const lineNumbers = useMemo(() => {
            const lines = value.split('\n')
            return lines.map((_, i) => i + 1)
        }, [value])

        // Handle text changes
        const handleChange = useCallback(
            (e: ChangeEvent<HTMLTextAreaElement>) => {
                const newValue = e.target.value
                const cursorPosition = e.target.selectionStart
                onChange(newValue, cursorPosition)
            },
            [onChange],
        )

        // Handle scroll sync between line numbers and textarea
        const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
            const target = e.currentTarget
            const lineNumbersEl = target.previousElementSibling as HTMLElement | null
            if (lineNumbersEl) {
                lineNumbersEl.scrollTop = target.scrollTop
            }
        }, [])

        return (
            <div className="relative flex h-full bg-[var(--bg-primary)]">
                {/* Line numbers */}
                <div
                    className="pointer-events-none shrink-0 overflow-hidden border-r border-[var(--border)] bg-[var(--bg-primary)] py-4 text-right font-mono text-sm leading-6 text-[var(--line-number)]"
                    style={{ width: '48px' }}
                    aria-hidden="true"
                >
                    {lineNumbers.map((num) => (
                        <div key={num} className="px-2">
                            {num}
                        </div>
                    ))}
                </div>

                {/* Editor textarea */}
                <textarea
                    ref={ref}
                    value={value}
                    onChange={handleChange}
                    onScroll={handleScroll}
                    className="flex-1 resize-none bg-[var(--bg-primary)] px-4 py-4 font-[var(--font-jetbrains-mono),monospace] text-sm leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                    placeholder="Start typing your markdown..."
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                />
            </div>
        )
    },
)
