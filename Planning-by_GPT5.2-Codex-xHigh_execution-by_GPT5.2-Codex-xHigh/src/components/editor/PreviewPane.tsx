'use client'

import { useMemo } from 'react'

import { parseMarkdown } from '@/lib/markdown/parser'

interface PreviewPaneProps {
  content: string
}

export function PreviewPane({ content }: PreviewPaneProps) {
  const html = useMemo(() => parseMarkdown(content), [content])

  return (
    <div className="h-full overflow-auto bg-[var(--bg-secondary)] p-6">
      <article className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
