'use client'

/**
 * Preview pane component for rendered markdown.
 */

import { useMemo } from 'react'
import { parseMarkdown } from '@/lib/markdown/parser'

export interface PreviewPaneProps {
    content: string
}

/**
 * Markdown preview pane.
 * Renders parsed markdown as HTML.
 */
export function PreviewPane({ content }: PreviewPaneProps) {
    // Parse markdown to HTML
    const html = useMemo(() => parseMarkdown(content), [content])

    return (
        <div className="h-full overflow-auto bg-[var(--bg-secondary)]">
            <article
                className="prose mx-auto max-w-none p-6"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    )
}
