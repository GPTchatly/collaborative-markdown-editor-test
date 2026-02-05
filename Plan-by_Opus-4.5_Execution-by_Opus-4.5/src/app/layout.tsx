import type { Metadata } from 'next'
import { JetBrains_Mono, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
    variable: '--font-jetbrains-mono',
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Collaborative Markdown Editor',
    description:
        'A real-time collaborative markdown editor with live preview and operational transformation.',
    keywords: ['markdown', 'editor', 'collaborative', 'real-time', 'next.js'],
    authors: [{ name: 'Collaborative Editor Team' }],
    openGraph: {
        title: 'Collaborative Markdown Editor',
        description: 'Real-time collaborative markdown editing with live preview',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
            <body className="min-h-screen bg-[var(--bg-primary)] antialiased">{children}</body>
        </html>
    )
}
