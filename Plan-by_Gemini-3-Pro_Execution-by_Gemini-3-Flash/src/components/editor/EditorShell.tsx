import { EditorClient } from './EditorClient'

export async function EditorShell() {
  // Use absolute URL for server-side fetch in Next.js
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  let initialDoc = {
    text: '# Collaborative Markdown Editor\n\nFailed to load initial document state. Reconnecting...',
    revision: 0,
  }

  try {
    const res = await fetch(`${baseUrl}/api/document`, {
      cache: 'no-store',
    })

    if (res.ok) {
      initialDoc = await res.json()
    }
  } catch (err) {
    console.error('Failed to fetch initial document:', err)
  }

  return (
    <div className="h-screen bg-bg-primary">
      <EditorClient initialDocument={initialDoc} />
    </div>
  )
}
