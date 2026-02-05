# Collaborative Markdown Editor

A real-time collaborative markdown editor built with Next.js 16.1.6, React 19, and Tailwind CSS 4.

## Features

- **Real-time Collaboration**: Multiple users can edit the same document simultaneously via Server-Sent Events (SSE).
- **Operational Transformation (OT)**: Conflict resolution using custom transformation logic for inserts and deletes.
- **Custom Markdown Parser**: A regex-based markdown-to-HTML parser implemented without external dependencies.
- **VS Code Inspired UI**: A polished dark theme with split-screen editing and preview.
- **TypeScript Strict Mode**: Fully type-safe implementation.
- **Next.js 16 App Router**: Follows the latest architectural patterns and Server Component boundaries.

## Tech Stack

- **Framework**: Next.js 16.1.6
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4.1.18
- **Real-time**: Server-Sent Events (SSE)
- **Validation**: Zod 3.25.0
- **IDs**: Nanoid 5.1.0

## Getting Started

### Prerequisites

- Node.js 24.x
- pnpm 10.x

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run the development server:
   ```bash
   pnpm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verification

To run full project verification (lint, typecheck, format, build):
```bash
pnpm run ci:verify
```

> [!NOTE]
> Due to a known circular reference issue in the ESLint 9 Flat Config validator when using `FlatCompat` with some Next.js configs, `pnpm run lint` may fail with a serializing error. However, `pnpm run typecheck` and `pnpm run build` are fully passing.

## Architecture

- `src/app/api`: Server-side endpoints for document state and real-time events.
- `src/server`: In-memory singleton document store and OT engine.
- `src/lib/ot`: Transformation logic and operation application.
- `src/lib/markdown`: Custom markdown parsing engine.
- `src/hooks`: Collaboration logic and synchronization hooks.
- `src/components`: UI components following Server/Client boundaries.
