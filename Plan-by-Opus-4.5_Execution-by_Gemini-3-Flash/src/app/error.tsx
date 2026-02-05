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
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--error)]/10">
          <svg
            className="h-8 w-8 text-[var(--error)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Something went wrong</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="rounded bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-blue)]/80"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
