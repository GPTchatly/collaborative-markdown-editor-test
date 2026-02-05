'use client'

import { useMemo } from 'react'
import { parseMarkdown } from '@/lib/markdown/parser'

interface PreviewPaneProps {
  content: string
}

export function PreviewPane({ content }: PreviewPaneProps) {
  const html = useMemo(() => parseMarkdown(content), [content])

  return (
    <div className="flex-1 overflow-auto bg-[#252526] p-8 scroll-smooth">
      <article
        className="prose prose-invert max-w-3xl mx-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
