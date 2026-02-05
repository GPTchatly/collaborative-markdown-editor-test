// This is a Server Component
import { EditorClient } from './EditorClient'
import { getDocument } from '@/server/document-store'

export async function EditorShell() {
  // Direct server-call for initial state (since we are in the same Next.js app)
  // We can use the logic directly instead of fetch to avoid self-signed cert issues or URL resolution issues in dev.
  const initialDoc = getDocument()

  return (
    <div className="h-full bg-[#1e1e1e] text-[#d4d4d4]">
      <EditorClient initialDocument={initialDoc} />
    </div>
  )
}
