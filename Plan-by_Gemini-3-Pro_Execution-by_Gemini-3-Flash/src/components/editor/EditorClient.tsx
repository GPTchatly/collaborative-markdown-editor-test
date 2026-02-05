'use client'

import { useCollaboration } from '@/hooks/use-collaboration'
import { CodePane } from './CodePane'
import { PreviewPane } from './PreviewPane'
import { StatusBar } from './StatusBar'
import type { Document } from '@/types/document'

interface EditorClientProps {
  initialDocument: Document
}

export function EditorClient({ initialDocument }: EditorClientProps) {
  const { text, status, revision, handleTextChange } = useCollaboration(initialDocument)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header / Toolbar */}
      <div className="flex h-12 items-center justify-between border-b border-[#3c3c3c] bg-[#2d2d30] px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-blue/10 text-accent-blue">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <span className="text-[13px] font-medium text-text-primary">
            Untitled.md — Collaborative Editor
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div
              className="h-7 w-7 rounded-full border-2 border-[#2d2d30] bg-accent-green"
              title="You"
            />
            {/* Other collaborators would appear here */}
          </div>
          <button className="rounded bg-accent-blue px-3 py-1 text-[12px] font-medium text-white hover:bg-[#0062a3] transition-colors">
            Share
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex flex-1 overflow-hidden">
        <CodePane value={text} onChange={handleTextChange} />
        <PreviewPane content={text} />
      </div>

      {/* Status Bar */}
      <StatusBar status={status} revision={revision} />
    </div>
  )
}
