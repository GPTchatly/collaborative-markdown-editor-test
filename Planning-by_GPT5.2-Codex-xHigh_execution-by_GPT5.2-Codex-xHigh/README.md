# Collaborative Markdown Editor

A real-time collaborative markdown editor built with Next.js 16 App Router, TypeScript, and Server Components by default. It uses Server-Sent Events (SSE) for live updates and an in-memory Operational Transformation (OT) engine for conflict handling.

## Requirements

- Node.js 24.x
- pnpm

## Setup

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
pnpm run lint
pnpm run typecheck
pnpm run format
pnpm run build

pnpm run ci:verify
```

## Project Notes

- Document state is stored in-memory. In a multi-instance deployment (like Vercel), each instance has its own memory store. For production, replace it with a shared database or cache.
- SSE keeps clients in sync and supports reconnection with exponential backoff.

## Deployment (Vercel)

- Ensure Node.js version is set to `24.x` in Vercel project settings.
- Recommended build command: `pnpm run ci:verify`.

## Structure

Key directories:

- `src/app` � App Router pages, layouts, and API routes
- `src/components` � Editor UI and shared components
- `src/hooks` � Collaboration and SSE logic
- `src/lib` � OT logic, markdown parser, utilities
- `src/server` � In-memory document store and SSE manager

## Limitations

- The OT implementation is optimized for single-range insert/delete operations. Complex replace operations are split into delete + insert.
- The markdown parser is regex-based and intended for lightweight usage. For advanced Markdown features, integrate a full parser on the server.
