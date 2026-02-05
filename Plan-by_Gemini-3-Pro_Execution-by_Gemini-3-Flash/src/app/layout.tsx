import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Collaborative Markdown Editor',
  description: 'A Next.js 16 real-time collaborative markdown editor',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">{children}</body>
    </html>
  )
}
