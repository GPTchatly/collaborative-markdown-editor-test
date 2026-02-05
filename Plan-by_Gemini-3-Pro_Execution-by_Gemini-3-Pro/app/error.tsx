'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-[var(--text-secondary)]">
        The editor ran into an unexpected error. Try reloading or reset the page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-sm text-[var(--text-primary)] transition hover:border-[var(--accent-blue)]"
      >
        Try again
      </button>
    </div>
  )
}
