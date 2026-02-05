# Collaborative Markdown Editor

A real-time collaborative markdown editor built with Next.js 16.1.6, featuring live preview, operational transformation for conflict resolution, and Server-Sent Events for real-time synchronization.

## Features

- **Real-time Collaboration** — Multiple users can edit simultaneously with automatic conflict resolution
- **Live Preview** — See rendered markdown as you type in a split-pane view
- **Operational Transformation** — Robust conflict resolution for concurrent edits
- **VS Code Dark+ Theme** — Professional, polished UI inspired by VS Code
- **Resizable Panels** — Drag to resize code and preview panes
- **Connection Status** — Visual indicator showing sync status

## Technology Stack

- **Next.js 16.1.6** — App Router with React Server Components
- **React 19.2.4** — Latest React with concurrent features
- **TypeScript 5.9.3** — Strict type safety
- **Tailwind CSS 4.1.18** — Styling
- **Custom OT Engine** — Operational transformation for collaboration
- **Custom Markdown Parser** — No external dependencies

## Getting Started

### Prerequisites

- Node.js 24.x
- pnpm (recommended)

### Installation

```bash
# Clone the repository
cd collaborative-markdown-editor

# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Testing Collaboration

1. Open the editor in your browser
2. Open another browser window/tab with the same URL
3. Start typing in either window
4. Watch changes appear in real-time in the other window

### Markdown Support

The editor supports common markdown syntax:

- **Headings**: `#`, `##`, `###`, etc.
- **Bold**: `**text**` or `__text__`
- **Italic**: `*text*` or `_text_`
- **Strikethrough**: `~~text~~`
- **Inline code**: `` `code` ``
- **Code blocks**: ` ``` ` with optional language
- **Lists**: `-`, `*`, or `1.`
- **Blockquotes**: `> quote`
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Horizontal rules**: `---` or `***`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type check |
| `pnpm format` | Check code formatting |
| `pnpm ci:verify` | Run all verification checks |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── document/      # Document operations
│   │   └── events/        # SSE endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/
│   ├── editor/            # Editor components
│   └── ui/                # Reusable UI components
├── hooks/                 # React hooks
├── lib/
│   ├── markdown/          # Markdown parser
│   ├── ot/                # Operational transformation
│   ├── sse/               # SSE client utilities
│   └── utils/             # Utility functions
├── server/                # Server-side modules
└── types/                 # TypeScript types
```

## Architecture

### Operational Transformation

The editor uses OT to handle concurrent edits:

1. Each edit generates an operation (insert or delete)
2. Operations are sent to the server with a base revision
3. Server transforms operations against any concurrent edits
4. Transformed operations are broadcast to all clients
5. Clients apply remote operations with cursor preservation

### Server-Sent Events

Real-time updates use SSE for low-latency communication:

- Clients connect to `/api/events` on load
- Server broadcasts document updates to all connected clients
- Automatic reconnection with exponential backoff

## License

MIT
