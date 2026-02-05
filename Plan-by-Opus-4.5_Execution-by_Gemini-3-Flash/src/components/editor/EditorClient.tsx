'use client'

import { useRef } from 'react'
import { CodePane } from './CodePane'
import { PreviewPane } from './PreviewPane'
import { StatusBar } from './StatusBar'
import { useCollaboration } from '@/hooks/use-collaboration'
import type { Document } from '@/types/document'

interface EditorClientProps {
  initialDocument: Document
}

export function EditorClient({ initialDocument }: EditorClientProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { text, status, revision, clientId, handleTextChange } = useCollaboration(
    initialDocument,
    textareaRef,
  )

  return (
    <div className="flex h-screen flex-col bg-[var(--bg-primary)]">
      <div className="flex flex-1 overflow-hidden">
        <CodePane value={text} onChange={handleTextChange} />
        <PreviewPane content={text} />
      </div>
      <StatusBar status={status} revision={revision} clientId={clientId} />
    </div>
  )
}
