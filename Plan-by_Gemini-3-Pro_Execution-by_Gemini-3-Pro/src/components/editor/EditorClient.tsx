'use client'

import { CodePane } from './CodePane'
import { PreviewPane } from './PreviewPane'
import { StatusBar } from './StatusBar'
import { Toolbar } from './Toolbar'
import { ResizablePanel } from '@/components/ui/ResizablePanel'
import { useCollaboration } from '@/hooks/use-collaboration'
import type { DocumentSnapshot } from '@/types/document'

interface EditorClientProps {
  initialDocument: DocumentSnapshot
}

export function EditorClient({ initialDocument }: EditorClientProps) {
  const { text, status, revision, cursorPosition, handleTextChange } =
    useCollaboration(initialDocument)

  return (
    <div className="flex h-screen flex-col">
      <Toolbar />
      <ResizablePanel
        left={<CodePane value={text} cursorPosition={cursorPosition} onChange={handleTextChange} />}
        right={<PreviewPane content={text} />}
      />
      <StatusBar status={status} revision={revision} />
    </div>
  )
}
