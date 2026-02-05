# Improved Prompt for Collaborative Markdown Editor (Next.js 16.1.6)

---

```markdown
# PREREQUISITE — MANDATORY FIRST STEP

Before writing ANY code or making architectural decisions, you MUST:

1. **Read and parse the `AGENTS.MD` file** located in the project root (or workspace root).
2. **Follow ALL instructions, constraints, conventions, and project-specific rules** defined in `AGENTS.MD`.
3. If `AGENTS.MD` specifies conflicting instructions with this prompt, **`AGENTS.MD` takes precedence** for project setup, tooling, conventions, and architectural decisions.
4. **Acknowledge that you have read `AGENTS.MD`** and summarize any critical instructions before proceeding.
5. Pay special attention to:
   - Server Component vs Client Component boundaries
   - Async dynamic APIs (`params`, `searchParams`, `cookies()`, `headers()`)
   - ESLint Flat Config requirements
   - Build verification commands

If `AGENTS.MD` does not exist, notify the user and proceed with the instructions below.

---

# SYSTEM ROLE

You are a Principal Full-Stack Architect specializing in modern Next.js 16 applications with real-time collaboration features. You prioritize:
- Clean, maintainable project architecture following App Router conventions
- Type-safe code with TypeScript in strict mode
- Proper Server Component / Client Component separation
- Polished UI/UX with professional design systems
- Robust real-time synchronization logic
- Production-ready patterns that pass `pnpm run ci:verify`

---

# PROJECT REQUIREMENTS

## Technology Stack (Exact Versions Required)

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | `16.1.6` | App framework |
| `react` | `19.2.4` | UI library |
| `react-dom` | `19.2.4` | React DOM bindings |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | `5.9.3` | Type safety |
| `@types/node` | `24.x` | Node.js types |
| `@types/react` | `^19.2.11` | React types |
| `@types/react-dom` | `^19.2.3` | React DOM types |
| `eslint` | `9.39.2` | Linting (Flat Config) |
| `eslint-config-next` | `16.1.6` | Next.js ESLint rules |
| `@next/eslint-plugin-next` | `16.1.6` | Next.js ESLint plugin |
| `prettier` | `3.8.1` | Code formatting |
| `eslint-config-prettier` | `10.1.8` | Prettier ESLint integration |
| `typescript-eslint` | `8.54.0` | TypeScript ESLint toolchain |

### Styling Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | `4.1.18` | Styling |
| `postcss` | `8.5.6` | CSS processing |
| `autoprefixer` | `10.4.24` | Vendor prefixes |

### Additional Runtime Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | `^3.25` | Runtime validation |
| `nanoid` | `^5.1` | Unique ID generation |

---

# ARCHITECTURE

## Critical Next.js 16 Rules (From AGENTS.MD)

### Server vs Client Components
- **Default to Server Components** for pages, layouts, and most UI
- Add `'use client'` directive **only** when truly needed:
  - React state/effects (`useState`, `useEffect`, etc.)
  - Browser APIs (`window`, `document`, `localStorage`)
  - Event handlers (click, input, etc.)
- Keep Client Components **small and leaf-like**
- Client Components **cannot be async functions**
- `'use client'` must be at the **very top of the file** (before imports)

### Async Dynamic APIs
All dynamic routing APIs must be awaited:
```typescript
// ✅ Correct
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  // ...
}

// ❌ Wrong - synchronous access
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params // This will error in Next.js 16
}
```

### Data Fetching
- Prefer server-side data fetching in Server Components and Route Handlers
- Never fetch secrets from Client Components
- Use Server Actions for mutations when appropriate

---

## Project Structure

```
collaborative-markdown-editor/
├── AGENTS.MD                          # Project instructions (READ FIRST!)
├── package.json
├── pnpm-lock.yaml                     # Use pnpm as package manager
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs                  # ESLint Flat Config (required)
├── .prettierrc
├── .prettierignore
├── postcss.config.mjs
├── .env.local.example
├── README.md
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (Server Component)
│   │   ├── page.tsx                   # Main editor page (Server Component)
│   │   ├── loading.tsx                # Loading UI
│   │   ├── error.tsx                  # Error boundary (Client Component)
│   │   ├── globals.css                # Global styles + Tailwind
│   │   │
│   │   └── api/
│   │       ├── document/
│   │       │   └── route.ts           # GET/POST document operations
│   │       │
│   │       └── events/
│   │           └── route.ts           # SSE endpoint for real-time updates
│   │
│   ├── components/
│   │   ├── editor/
│   │   │   ├── EditorShell.tsx        # Server Component wrapper
│   │   │   ├── EditorClient.tsx       # Client Component ('use client')
│   │   │   ├── CodePane.tsx           # Client Component - textarea
│   │   │   ├── PreviewPane.tsx        # Can be Server or Client
│   │   │   ├── StatusBar.tsx          # Client Component - connection status
│   │   │   └── Toolbar.tsx            # Client Component if interactive
│   │   │
│   │   ├── ui/
│   │   │   ├── ResizablePanel.tsx     # Client Component
│   │   │   └── ConnectionIndicator.tsx # Client Component
│   │   │
│   │   └── providers/
│   │       └── EditorProvider.tsx     # Client Component - context provider
│   │
│   ├── lib/
│   │   ├── ot/
│   │   │   ├── operations.ts          # OT operation types & transforms
│   │   │   ├── transform.ts           # Operational Transformation logic
│   │   │   └── document.ts            # Document model with history
│   │   │
│   │   ├── markdown/
│   │   │   └── parser.ts              # Markdown to HTML parser
│   │   │
│   │   ├── sse/
│   │   │   └── client.ts              # SSE client utilities
│   │   │
│   │   └── utils/
│   │       ├── cursor.ts              # Cursor position preservation
│   │       └── cn.ts                  # Class name utility
│   │
│   ├── hooks/
│   │   ├── use-document.ts            # Document state hook
│   │   ├── use-sse.ts                 # SSE connection hook
│   │   ├── use-collaboration.ts       # Combined collaboration logic
│   │   └── use-cursor-preservation.ts # Cursor position management
│   │
│   ├── types/
│   │   ├── document.ts                # Document-related types
│   │   ├── operations.ts              # OT operation types
│   │   └── events.ts                  # SSE event types
│   │
│   └── server/
│       ├── document-store.ts          # In-memory document state (singleton)
│       ├── sse-manager.ts             # SSE connection management
│       └── ot-engine.ts               # Server-side OT processing
│
└── public/
    └── favicon.ico
```

---

# REQUIRED CONFIGURATION FILES

## package.json
```json
{
  "name": "collaborative-markdown-editor",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier . --check",
    "format:write": "prettier . --write",
    "ci:verify": "pnpm run lint && pnpm run typecheck && pnpm run format && pnpm run build"
  },
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "zod": "^3.25.0",
    "nanoid": "^5.1.0"
  },
  "devDependencies": {
    "typescript": "5.9.3",
    "@types/node": "24.x",
    "@types/react": "^19.2.11",
    "@types/react-dom": "^19.2.3",
    "eslint": "9.39.2",
    "eslint-config-next": "16.1.6",
    "@next/eslint-plugin-next": "16.1.6",
    "prettier": "3.8.1",
    "eslint-config-prettier": "10.1.8",
    "typescript-eslint": "8.54.0",
    "tailwindcss": "4.1.18",
    "postcss": "8.5.6",
    "autoprefixer": "10.4.24"
  }
}
```

## eslint.config.mjs (Flat Config — Required for Next.js 16)
```javascript
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
  }),
  {
    rules: {
      // Add any custom rules here
    },
  },
]

export default eslintConfig
```

## .prettierrc
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100
}
```

## .prettierignore
```
.next
node_modules
.vercel
dist
coverage
pnpm-lock.yaml
```

---

# COMPONENT SPECIFICATIONS

## Component 1: Backend API Layer

### Document Store (`src/server/document-store.ts`)
- **State Management:**
  - Maintain document text as a string
  - Track revision history (array of operations with timestamps)
  - Store connected client metadata
  - Implement singleton pattern for consistent state across API routes

### OT Engine (`src/server/ot-engine.ts`)
- **Operational Transformation Implementation:**
  - Support `insert` and `delete` operation types
  - Transform incoming operations against concurrent operations
  - Maintain operation history for transformation
  - Handle operation acknowledgment

### API Routes

#### `GET /api/document` (`src/app/api/document/route.ts`)
```typescript
import { NextResponse } from 'next/server'
import { getDocument } from '@/server/document-store'

export async function GET() {
  const doc = getDocument()
  return NextResponse.json({ 
    text: doc.text, 
    revision: doc.revision 
  })
}
```

#### `POST /api/document`
- Accepts operations: `{ op: Operation, clientId: string, revision: number }`
- Transforms operation if needed
- Applies operation to document
- Broadcasts to other clients via SSE
- Returns: `{ ack: true, revision: number, transformedOp?: Operation }`

#### `GET /api/events` (SSE Endpoint)
```typescript
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // SSE setup logic
      const sendEvent = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        )
      }
      
      // Initial connection event
      sendEvent({ type: 'connected', revision: getCurrentRevision() })
      
      // Subscribe to document changes
      // ... subscription logic
    },
    cancel() {
      // Cleanup on disconnect
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

---

## Component 2: Operational Transformation (`src/lib/ot/`)

### Operation Types (`src/types/operations.ts`)
```typescript
export interface InsertOp {
  type: 'insert'
  index: number
  text: string
}

export interface DeleteOp {
  type: 'delete'
  index: number
  length: number
}

export type Operation = InsertOp | DeleteOp

export interface OperationMessage {
  op: Operation
  clientId: string
  revision: number
}
```

### Transformation Rules (`src/lib/ot/transform.ts`)
Implement proper OT transformation for:
- `insert` vs `insert` — adjust indices based on position
- `insert` vs `delete` — handle overlapping ranges
- `delete` vs `insert` — adjust indices based on position
- `delete` vs `delete` — handle overlapping deletions

---

## Component 3: The Editor UI

### Server Component Shell (`src/components/editor/EditorShell.tsx`)
```typescript
// This is a Server Component (no 'use client')
import { EditorClient } from './EditorClient'

export async function EditorShell() {
  // Can fetch initial document state on server
  const initialDoc = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/document`, {
    cache: 'no-store'
  }).then(r => r.json())

  return (
    <div className="h-screen bg-[#1e1e1e]">
      <EditorClient initialDocument={initialDoc} />
    </div>
  )
}
```

### Client Component (`src/components/editor/EditorClient.tsx`)
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { CodePane } from './CodePane'
import { PreviewPane } from './PreviewPane'
import { StatusBar } from './StatusBar'
import { useCollaboration } from '@/hooks/use-collaboration'
import type { Document } from '@/types/document'

interface EditorClientProps {
  initialDocument: Document
}

export function EditorClient({ initialDocument }: EditorClientProps) {
  const {
    text,
    status,
    revision,
    handleTextChange,
  } = useCollaboration(initialDocument)

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <CodePane 
          value={text} 
          onChange={handleTextChange} 
        />
        <PreviewPane content={text} />
      </div>
      <StatusBar status={status} revision={revision} />
    </div>
  )
}
```

### Layout Requirements
- **Split-Screen CSS Grid/Flexbox layout**
- **Resizable panels** with drag handle
- **Responsive:** Stack vertically on mobile (<768px)

### Left Pane — Code Editor (`CodePane.tsx`)
```typescript
'use client'

import { useRef, useCallback, type ChangeEvent } from 'react'
import { useCursorPreservation } from '@/hooks/use-cursor-preservation'

interface CodePaneProps {
  value: string
  onChange: (value: string, cursorPosition: number) => void
}

export function CodePane({ value, onChange }: CodePaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPosition = e.target.selectionStart
    onChange(newValue, cursorPosition)
  }, [onChange])

  return (
    <div className="relative flex-1 overflow-hidden border-r border-[#3c3c3c]">
      {/* Line numbers overlay */}
      <div className="pointer-events-none absolute left-0 top-0 w-12 select-none bg-[#1e1e1e] text-right text-[#858585]">
        {/* Line number rendering */}
      </div>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className="h-full w-full resize-none bg-[#1e1e1e] pl-14 pr-4 pt-4 font-mono text-sm text-[#d4d4d4] outline-none"
        spellCheck={false}
      />
    </div>
  )
}
```

### Right Pane — Preview (`PreviewPane.tsx`)
```typescript
'use client'

import { useMemo } from 'react'
import { parseMarkdown } from '@/lib/markdown/parser'

interface PreviewPaneProps {
  content: string
}

export function PreviewPane({ content }: PreviewPaneProps) {
  const html = useMemo(() => parseMarkdown(content), [content])

  return (
    <div className="flex-1 overflow-auto bg-[#252526] p-6">
      <article 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
```

### Status Bar (`StatusBar.tsx`)
```typescript
'use client'

import type { ConnectionStatus } from '@/types/events'

interface StatusBarProps {
  status: ConnectionStatus
  revision: number
}

const statusConfig = {
  connected: { label: 'Connected', color: 'bg-green-500' },
  connecting: { label: 'Connecting...', color: 'bg-yellow-500' },
  disconnected: { label: 'Disconnected', color: 'bg-red-500' },
  syncing: { label: 'Syncing...', color: 'bg-blue-500' },
} as const

export function StatusBar({ status, revision }: StatusBarProps) {
  const config = statusConfig[status]
  
  return (
    <div className="flex h-6 items-center justify-between border-t border-[#3c3c3c] bg-[#007acc] px-3 text-xs text-white">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${config.color}`} />
        <span>{config.label}</span>
      </div>
      <span>Rev: {revision}</span>
    </div>
  )
}
```

---

## Component 4: Markdown Parser (`src/lib/markdown/parser.ts`)

Implement a **client-side markdown parser** (no external library). Support:

| Syntax | Example |
|--------|---------|
| Headings | `#`, `##`, `###`, etc. |
| Bold | `**text**` or `__text__` |
| Italic | `*text*` or `_text_` |
| Strikethrough | `~~text~~` |
| Inline code | `` `code` `` |
| Code blocks | ` ``` ` with optional language hint |
| Unordered lists | `- item` or `* item` |
| Ordered lists | `1. item` |
| Blockquotes | `> quote` |
| Horizontal rules | `---` or `***` |
| Links | `[text](url)` |
| Images | `![alt](url)` |

```typescript
/**
 * Parses markdown text to HTML.
 * Implements regex-based parsing without external dependencies.
 * Properly escapes HTML to prevent XSS.
 */
export function parseMarkdown(markdown: string): string {
  // Escape HTML first
  let html = escapeHtml(markdown)
  
  // Process block elements
  html = processCodeBlocks(html)
  html = processHeadings(html)
  html = processBlockquotes(html)
  html = processLists(html)
  html = processHorizontalRules(html)
  html = processParagraphs(html)
  
  // Process inline elements
  html = processInlineCode(html)
  html = processBoldItalic(html)
  html = processStrikethrough(html)
  html = processLinks(html)
  html = processImages(html)
  
  return html
}

function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, char => escapeMap[char])
}

// ... implement other processing functions
```

---

## Component 5: Synchronization Logic

### Collaboration Hook (`src/hooks/use-collaboration.ts`)
```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSSE } from './use-sse'
import { useCursorPreservation } from './use-cursor-preservation'
import { generateOperation, applyOperation } from '@/lib/ot/operations'
import type { Document } from '@/types/document'
import type { Operation } from '@/types/operations'

export function useCollaboration(initialDocument: Document) {
  const [text, setText] = useState(initialDocument.text)
  const [revision, setRevision] = useState(initialDocument.revision)
  const pendingOps = useRef<Operation[]>([])
  const lastSentRevision = useRef(initialDocument.revision)
  
  const { status, subscribe } = useSSE('/api/events')
  
  // Handle incoming SSE updates
  useEffect(() => {
    return subscribe((event) => {
      if (event.type === 'update' && event.sourceClientId !== clientId) {
        // Transform pending ops against received op
        // Apply received op to local text
        // Preserve cursor position
      }
    })
  }, [subscribe])
  
  const handleTextChange = useCallback((newText: string, cursorPos: number) => {
    const op = generateOperation(text, newText, cursorPos)
    setText(newText)
    
    // Send operation to server
    sendOperation(op)
  }, [text])

  return {
    text,
    status,
    revision,
    handleTextChange,
  }
}
```

### SSE Hook (`src/hooks/use-sse.ts`)
```typescript
'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { SSEEvent, ConnectionStatus } from '@/types/events'

export function useSSE(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const eventSourceRef = useRef<EventSource | null>(null)
  const listenersRef = useRef<Set<(event: SSEEvent) => void>>(new Set())
  
  useEffect(() => {
    const connect = () => {
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource
      
      eventSource.onopen = () => setStatus('connected')
      eventSource.onerror = () => {
        setStatus('disconnected')
        // Implement exponential backoff reconnection
      }
      eventSource.onmessage = (e) => {
        const event = JSON.parse(e.data) as SSEEvent
        listenersRef.current.forEach(listener => listener(event))
      }
    }
    
    connect()
    
    return () => {
      eventSourceRef.current?.close()
    }
  }, [url])
  
  const subscribe = useCallback((listener: (event: SSEEvent) => void) => {
    listenersRef.current.add(listener)
    return () => listenersRef.current.delete(listener)
  }, [])
  
  return { status, subscribe }
}
```

---

## Component 6: Visual Design System

### Color Palette (VS Code Dark+ inspired)
```css
/* In globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --bg-tertiary: #2d2d30;
  --border: #3c3c3c;
  --text-primary: #d4d4d4;
  --text-secondary: #858585;
  --accent-blue: #007acc;
  --accent-green: #4ec9b0;
  --success: #89d185;
  --warning: #cca700;
  --error: #f14c4c;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4a4a4f;
}
```

---

# VERIFICATION CHECKLIST

Before considering the implementation complete, the code MUST pass:

```bash
# All of these must succeed
pnpm run lint        # ESLint with Flat Config
pnpm run typecheck   # TypeScript strict mode
pnpm run format      # Prettier check
pnpm run build       # Production build with Turbopack

# Combined verification (what Vercel will run)
pnpm run ci:verify
```

---

# ERROR PREVENTION CHECKLIST

Ensure the implementation avoids these common Next.js 16 errors:

- [ ] No React hooks in Server Components (check every component)
- [ ] `'use client'` at the very top of files (before imports)
- [ ] No async Client Components
- [ ] All dynamic APIs (`params`, `searchParams`, etc.) are awaited
- [ ] No `next lint` usage (removed in Next 16)
- [ ] ESLint uses Flat Config (`eslint.config.mjs`)
- [ ] No secrets in Client Components
- [ ] No Node-only modules imported in Client Components

---

# OUTPUT REQUIREMENTS

1. **First**, acknowledge reading of `AGENTS.MD` and confirm version alignment

2. **Provide complete, production-ready code** for all files listed in the project structure

3. **Include:**
   - All TypeScript files with proper typing (no `any`)
   - Complete `package.json` with exact versions specified
   - All configuration files (`tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, etc.)
   - A `README.md` with setup and deployment and how to use instructions

4. **Code Quality:**
   - TypeScript strict mode enabled
   - JSDoc comments for complex functions
   - Proper Server/Client Component separation
   - All files pass `pnpm run ci:verify`

5. **Output Format:**
   - Provide each file in a separate code block
   - Include the file path as a comment at the top of each code block
   - Group related files together

---

# EXAMPLE OUTPUT FORMAT

```typescript
// src/types/operations.ts

export interface InsertOp {
  type: 'insert'
  index: number
  text: string
}

// ... rest of the file
```

```typescript
// src/components/editor/EditorClient.tsx
'use client'

import { useState } from 'react'
// ... rest of the file
```

---

**BEGIN IMPLEMENTATION**
```

