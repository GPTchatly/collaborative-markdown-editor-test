'use client'

import { useCallback } from 'react'

import type { Document } from '@/types/document'
import { useCollaboration } from '@/hooks/use-collaboration'
import { CodePane } from './CodePane'
import { PreviewPane } from './PreviewPane'
import { StatusBar } from './StatusBar'
import { Toolbar } from './Toolbar'
import { ResizablePanel } from '@/components/ui/ResizablePanel'
import { ConnectionIndicator } from '@/components/ui/ConnectionIndicator'

interface EditorClientProps {
  initialDocument: Document
}

export function EditorClient({ initialDocument }: EditorClientProps) {
  const { text, status, revision, cursorPosition, handleTextChange, setCursorPosition } =
    useCollaboration(initialDocument)

  const handleCopy = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }, [text])

  const handleDownload = useCallback(() => {
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'document.md'
    link.click()
    URL.revokeObjectURL(url)
  }, [text])

  const handleClear = useCallback(() => {
    handleTextChange('', 0)
    setCursorPosition(0)
  }, [handleTextChange, setCursorPosition])

  return (
    <div className="flex h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[rgba(30,30,30,0.8)] px-4 py-3 backdrop-blur">
        <div>
          <p className="font-display text-lg tracking-tight text-[var(--text-primary)]">
            Collaborative Markdown Editor
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
            Live sync - Local-first edits
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ConnectionIndicator status={status} />
          <Toolbar onCopy={handleCopy} onDownload={handleDownload} onClear={handleClear} />
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanel
          left={
            <CodePane value={text} cursorPosition={cursorPosition} onChange={handleTextChange} />
          }
          right={<PreviewPane content={text} />}
        />
      </div>

      <StatusBar status={status} revision={revision} />
    </div>
  )
}
