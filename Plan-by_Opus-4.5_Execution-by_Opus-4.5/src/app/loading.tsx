export default function Loading() {
    return (
        <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent-blue)] border-t-transparent" />
                <p className="text-sm text-[var(--text-secondary)]">Loading editor...</p>
            </div>
        </div>
    )
}
