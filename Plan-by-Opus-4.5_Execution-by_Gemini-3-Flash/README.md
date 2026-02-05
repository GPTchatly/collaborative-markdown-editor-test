# Collaborative Markdown Editor

A real-time collaborative markdown editor built with Next.js 16.1.6, featuring Operational Transformation for conflict-free concurrent editing and live markdown preview.

## Features

- ✨ **Real-time Collaboration** - Multiple users can edit simultaneously with Operational Transformation
- 🔄 **Live Preview** - See your markdown rendered instantly as you type
- 🎨 **VS Code Dark+ Theme** - Beautiful, professional dark theme inspired by VS Code
- 📝 **Full Markdown Support** - Headings, lists, code blocks, links, images, and more
- 🚀 **Built with Next.js 16** - Latest App Router, Server Components, and Turbopack
- 💪 **Type-Safe** - Full TypeScript with strict mode enabled
- 🔒 **XSS Protected** - Custom markdown parser with HTML escaping

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Runtime**: Node.js 24.x
- **Language**: TypeScript 5.9.3 (strict mode)
- **Styling**: Tailwind CSS 4.1.18
- **Real-time**: Server-Sent Events (SSE)
- **Validation**: Zod
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 24.x
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd collaborative-markdown-editor
```

2. Install dependencies:

```bash
pnpm install
```

3. Create environment file:

```bash
cp .env.local.example .env.local
```

4. Start the development server:

```bash
pnpm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing Collaboration

To test real-time collaboration:

1. Open the app in two browser windows (or two different browsers)
2. Start typing in one window
3. Watch the changes appear in the other window instantly

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix ESLint errors
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run format` - Check code formatting with Prettier
- `pnpm run format:write` - Fix code formatting
- `pnpm run ci:verify` - Run all checks (lint + typecheck + format + build)

## Project Structure

```
collaborative-markdown-editor/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── document/      # Document operations
│   │   │   └── events/        # SSE endpoint
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page
│   │   ├── loading.tsx        # Loading UI
│   │   └── error.tsx          # Error boundary
│   ├── components/            # React components
│   │   └── editor/            # Editor components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core libraries
│   │   ├── markdown/          # Markdown parser
│   │   ├── ot/                # Operational Transformation
│   │   └── utils/             # Utilities
│   ├── server/                # Server-side code
│   ├── types/                 # TypeScript types
├── .env.local.example         # Environment variables example
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## Architecture

### Operational Transformation

The editor uses Operational Transformation (OT) to handle concurrent edits:

1. **Client** generates an operation (insert/delete) based on text changes
2. **Client** sends operation to server with current revision number
3. **Server** transforms operation against concurrent operations
4. **Server** applies transformed operation and broadcasts to other clients
5. **Clients** receive and apply remote operations, preserving cursor position

### Server-Sent Events

Real-time updates are delivered via SSE:

- Automatic reconnection with exponential backoff
- Ping messages every 30 seconds to keep connection alive
- Graceful handling of disconnections

### Component Architecture

- **Server Components**: EditorShell, layout, page (fetch initial data)
- **Client Components**: EditorClient, CodePane, PreviewPane, StatusBar (interactive UI)
- **Hooks**: useSSE, useCollaboration, useCursorPreservation (state management)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_APP_URL` - Your production URL
4. Deploy!

Vercel will automatically:

- Detect Next.js and use the correct build command
- Use Node.js 24.x (based on `package.json` engines)
- Enable Turbopack for faster builds

### Build Command

For production builds with full verification:

```bash
pnpm run ci:verify
```

This runs:

1. ESLint checks
2. TypeScript type checking
3. Prettier formatting check
4. Production build

## Markdown Support

The editor supports:

- **Headings**: `#` through `######`
- **Bold**: `**text**` or `__text__`
- **Italic**: `*text*` or `_text_`
- **Strikethrough**: `~~text~~`
- **Inline Code**: `` `code` ``
- **Code Blocks**: ` ``` ` with optional language
- **Lists**: Unordered (`-`, `*`) and ordered (`1.`)
- **Blockquotes**: `> quote`
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Horizontal Rules**: `---` or `***`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires EventSource API support for real-time features.

## License

MIT

## Contributing

Contributions are welcome! Please ensure all changes pass `pnpm run ci:verify` before submitting.
