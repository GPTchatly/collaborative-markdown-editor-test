import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Collaborative Markdown Editor',
  description:
    'Real-time collaborative markdown editor with Operational Transformation and live preview',
  keywords: ['markdown', 'editor', 'collaboration', 'real-time', 'operational transformation'],
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
