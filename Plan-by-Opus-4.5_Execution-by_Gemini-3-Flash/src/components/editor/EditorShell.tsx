import { EditorClient } from './EditorClient'

export async function EditorShell() {
  // Fetch initial document state on server
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/document`, {
    cache: 'no-store',
  })

  const initialDoc = await response.json()

  return (
    <div className="h-screen bg-[var(--bg-primary)]">
      <EditorClient initialDocument={initialDoc} />
    </div>
  )
}
