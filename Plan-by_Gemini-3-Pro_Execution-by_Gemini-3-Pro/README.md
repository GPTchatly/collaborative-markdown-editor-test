# Collaborative Markdown Editor

A real-time collaborative markdown editor built with Next.js 16 (App Router), TypeScript, and Server-Sent Events.

## Features

- Live markdown preview with a lightweight parser
- Real-time collaboration with basic operational transformation
- Split editor/preview layout with resizable panels
- VS Code Dark+ inspired UI

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

### Quality checks

```bash
pnpm run lint
pnpm run typecheck
pnpm run format
pnpm run build
```

Or run everything together:

```bash
pnpm run ci:verify
```

## Environment Variables

Copy `.env.local.example` to `.env.local` if you need to override the base URL.

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment (Vercel)

- Set Node.js version to `24.x` in Vercel Project Settings.
- Recommended build command: `pnpm run ci:verify`.
- Vercel detects pnpm via `pnpm-lock.yaml` (if present).

## Notes

This app uses in-memory storage for the document and operation history. Restarting the server clears state.
