import type { Metadata } from 'next'
import { Atkinson_Hyperlegible, Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Collaborative Markdown Editor',
  description: 'Real-time collaborative markdown editor with live preview.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${atkinson.variable} ${fraunces.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] antialiased">
        {children}
      </body>
    </html>
  )
}
