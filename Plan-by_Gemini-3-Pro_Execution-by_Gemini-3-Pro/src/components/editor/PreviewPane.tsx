'use client'

import { useMemo } from 'react'
import { parseMarkdown } from '@/lib/markdown/parser'

interface PreviewPaneProps {
  content: string
}

export function PreviewPane({ content }: PreviewPaneProps) {
  const html = useMemo(() => parseMarkdown(content), [content])

  return (
    <div className="flex-1 overflow-auto bg-[#252526] p-6 h-full">
      <div
        className="prose prose-invert max-w-none prose-headings:text-[#d4d4d4] prose-p:text-[#d4d4d4] prose-a:text-[#007acc] text-[#d4d4d4]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
