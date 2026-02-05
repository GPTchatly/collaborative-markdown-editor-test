'use client'

/**
 * Editor client component.
 * Main client-side editor with collaboration features.
 */

import { useRef } from 'react'
import type { Document } from '@/types/document'
import { useCollaboration } from '@/hooks/use-collaboration'
import { ResizablePanel } from '@/components/ui/ResizablePanel'
import { CodePane } from './CodePane'
import { PreviewPane } from './PreviewPane'
import { StatusBar } from './StatusBar'

export interface EditorClientProps {
    initialDocument: Document
}

/**
 * Main editor client component.
 * Manages collaboration state and renders code/preview panes.
 */
export function EditorClient({ initialDocument }: EditorClientProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { text, status, revision, handleTextChange } = useCollaboration({
        initialDocument,
        textareaRef,
    })

    return (
        <div className="flex h-full flex-col">
            {/* Main content area */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanel
                    leftPanel={
                        <CodePane
                            ref={textareaRef}
                            value={text}
                            onChange={handleTextChange}
                        />
                    }
                    rightPanel={<PreviewPane content={text} />}
                    defaultRatio={0.5}
                />
            </div>

            {/* Status bar */}
            <StatusBar status={status} revision={revision} />
        </div>
    )
}
