'use client'

import { useMemo } from 'react'
import { parseMarkdown } from '@/lib/markdown/parser'

interface PreviewPaneProps {
  content: string
}

export function PreviewPane({ content }: PreviewPaneProps) {
  const html = useMemo(() => parseMarkdown(content), [content])

  return (
    <div className="h-full flex-1 overflow-auto bg-[var(--bg-secondary)] p-6">
      <article
        className="prose prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-[var(--text-primary)] prose-a:text-[var(--accent-blue)] prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-[var(--bg-tertiary)] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[var(--accent-green)] prose-pre:bg-[var(--bg-tertiary)] prose-pre:text-[var(--text-primary)] prose-blockquote:border-l-[var(--accent-blue)] prose-blockquote:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)] prose-ul:text-[var(--text-primary)] prose-ol:text-[var(--text-primary)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
