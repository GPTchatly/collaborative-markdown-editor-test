import { getDocument } from '@/server/document-store'
import { EditorClient } from './EditorClient'

export function EditorShell() {
  const initialDocument = getDocument()

  return (
    <div className="h-screen bg-[var(--bg-primary)]">
      <EditorClient initialDocument={initialDocument} />
    </div>
  )
}
