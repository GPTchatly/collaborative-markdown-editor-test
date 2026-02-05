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
    <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] px-6">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
        <p className="font-display text-lg text-[var(--text-primary)]">Something went wrong.</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-full bg-[var(--accent-blue)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:brightness-110"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
