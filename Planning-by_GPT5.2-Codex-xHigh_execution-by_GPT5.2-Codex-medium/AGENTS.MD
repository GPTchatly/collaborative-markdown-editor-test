
# AGENTS.MD — Next.js 16.1.6 + Vercel (lint/build/deploy instructions for a coding LLM)

## 1) Target stack (pin these expectations)
**Framework**
* Next.js: `16.1.6`
* App Router (`app/`), React Server Components by default
* Turbopack is the default for `next dev` and `next build`

**Runtime**
* Node.js: `24.x` (Vercel default). Minimum supported by Next 16: Node `20.9+`.

**React**
* `react` + `react-dom`: `19.2.4` (keep them exactly in sync)

**TypeScript**
* TypeScript: `5.9.3` (Next 16 minimum is TS 5.1+)

**Lint / Format**
* ESLint: `9.39.2` (Flat Config)
* `eslint-config-next`: `16.1.6`
* `@next/eslint-plugin-next`: `16.1.6`
* Prettier: `3.8.1`
* `eslint-config-prettier`: `10.1.8`
* TypeScript ESLint toolchain: `typescript-eslint@8.54.0` (and/or `@typescript-eslint/*@8.54.0`)

**Styling (if Tailwind is used)**
* Tailwind CSS: `4.1.18`
* PostCSS: `8.5.6`
* Autoprefixer: `10.4.24`

---

## 2) Prime directives for the coding agent
### 2.1 App Router architecture rules
* Default to **Server Components** for pages, layouts, and most UI.
* Add Client Components only when you truly need client-only features:
  * React state/effects
  * browser APIs (`window`, `document`, `localStorage`)
  * event handlers (click, input)
* Keep Client Components small and leaf-like; compose them inside Server Components.

### 2.2 Data fetching
* Prefer server-side data fetching in Server Components and Route Handlers.
* Do not fetch secrets from Client Components.
* If you need server-only keys, read them only on the server (Server Components / Route Handlers / Server Actions).

### 2.3 Routing conventions
* Use `app/` segment conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`).
* Avoid Parallel Routes unless required. If you use them, remember the `default.tsx` rule (see §8).

### 2.4 Vercel deploy-first mindset
* Every change must pass:
  * `pnpm run lint`
  * `pnpm run typecheck`
  * `pnpm run build`
* If any of these fail locally, it will fail on Vercel too.

---

## 3) Required package.json scripts (agent must keep these working)
Use `pnpm` (preferred) but the scripts should work with npm/yarn too.

```json
{
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
  }
}
````

Notes for the agent:

* Do not use `next lint` (removed in Next 16).
* Vercel runs your project’s `build` command. If you want Vercel to hard-fail on lint/type errors, set the Vercel Build Command to `pnpm run ci:verify` (Project Settings).

---

## 4) ESLint (Flat Config) — canonical setup for Next 16

### 4.1 Install (devDependencies)

Minimum set:

```bash
pnpm add -D eslint@9.39.2 eslint-config-next@16.1.6 @next/eslint-plugin-next@16.1.6 prettier@3.8.1 eslint-config-prettier@10.1.8
```

If you lint TypeScript semantics beyond Next defaults:

```bash
pnpm add -D typescript-eslint@8.54.0
```

### 4.2 eslint.config.mjs (Flat Config)

Create `eslint.config.mjs` at repo root:

```js
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
]

export default eslintConfig
```

### 4.3 Prettier integration

Create `.prettierrc` (example):

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all"
}
```

Create `.prettierignore` (example):

```gitignore
.next
node_modules
.vercel
dist
coverage
```

---

## 5) TypeScript guidance (strictness + build safety)

### 5.1 Baseline requirements

* Keep `"strict": true` unless you have a strong reason.
* Do not use TypeScript `any`.

### 5.2 Turbopack caveat

Turbopack does not perform type-checking by itself. Always run `pnpm run typecheck` (and keep CI enforcing it).

---

## 6) Vercel deployment rules (must not regress)

### 6.1 Node version alignment

* Vercel defaults to Node `24.x`.
* If your project needs a specific major, set it in:

  * Vercel Project Settings → Build & Deployment → Node.js Version
  * and/or `package.json` engines.

Recommended:

```json
{
  "engines": {
    "node": "24.x"
  }
}
```

### 6.2 Package manager detection

Vercel chooses the install command based on lockfiles:

* `pnpm-lock.yaml` → `pnpm install`
* `yarn.lock` → `yarn install`
* `package-lock.json` → `npm install`
  (So: keep your lockfile consistent and committed.)

### 6.3 Build image / environment assumptions

* Vercel builds in a Linux container (Amazon Linux 2023 base).
* Do not rely on OS-specific shell behavior; keep scripts portable.
* Prefer Node-only scripts over bash-heavy build steps.

### 6.4 Build Command strategy

Preferred:

* Vercel Build Command: `pnpm run ci:verify`
* Output dir: leave default (Next.js preset)

If you need a faster build:

* Vercel Build Command: `pnpm run build`
* Keep lint/type checks in CI (GitHub Actions), but then Vercel won’t gate them.

### 6.5 Local reproduction of Vercel builds

Use the Vercel CLI build step when debugging deploy-only issues:

```bash
vercel build
```

---

## 7) Dependency compatibility guardrails (agent must follow)

### 7.1 Keep these in sync

* `next`, `eslint-config-next`, `@next/eslint-plugin-next` should share the same `16.1.6` version line.
* `react` and `react-dom` must match exactly (`19.2.4`).

### 7.2 Recommended version ranges in package.json

For core deps:

```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "typescript": "5.9.3",
    "eslint": "9.39.2",
    "eslint-config-next": "16.1.6",
    "@next/eslint-plugin-next": "16.1.6",
    "prettier": "3.8.1",
    "eslint-config-prettier": "10.1.8",
    "typescript-eslint": "8.54.0",
    "@types/react": "^19.2.11",
    "@types/react-dom": "^19.2.3",
    "@types/node": "24.x"
  }
}
```

If Tailwind is used:

```json
{
  "devDependencies": {
    "tailwindcss": "4.1.18",
    "postcss": "8.5.6",
    "autoprefixer": "10.4.24"
  }
}
```

---

## 8) Allowed syntax & patterns (what will fail lint/build)

Next.js 16 (App Router) is strict about server/client boundaries and async routing APIs. The following patterns commonly **cause lint errors, dev errors, or production build failures** and must be avoided by the coding agent:

* Using React client hooks (`useState`, `useEffect`, `useInsertionEffect`, etc.) in a Server Component without marking it as a Client Component.
* Forgetting to put `'use client'` at the very top of a file (before imports) for Client Components, or passing non-serializable props across the server→client boundary.
* Writing Client Components as `async function Component()` (Client Components cannot be async).
* Accessing dynamic routing APIs synchronously: `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` must be awaited (new async behavior). Synchronous enumeration/spread of these values can also trigger warnings/errors.
* Creating Parallel Route slots without providing a required `default.tsx` fallback file for each `@slot` directory (build will fail).
* Importing Node-only modules into browser bundles (Client Components) or using Node APIs in Edge runtime contexts.
* Keeping a custom webpack configuration that is incompatible with Turbopack defaults during upgrade paths (treat custom bundler config as a high-risk area; test with `pnpm run build` on every change).

If you see an error, read the linked Next.js error page and refactor toward the rules above rather than silencing the error.

---

## 9) “If you touch it, you test it” checklists

### 9.1 Before committing

```bash
pnpm run lint
pnpm run typecheck
pnpm run format
pnpm run build
```

### 9.2 Before pushing changes that affect deployment

* Ensure `.env.example` exists and documents required vars (never commit secrets).
* Ensure Vercel Project Settings match `package.json` engines (Node major).
* Confirm no platform-specific scripts.
* Confirm no accidental large assets in git that bloat the build.

---

## 10) Quick error triage (agent playbook)

### 10.1 “React client hook in Server Component”

* Add `'use client'` at the top of the file OR move the hook into a small Client Component.

### 10.2 “Dynamic APIs are Asynchronous”

* Convert route segment props to async usage:

  * `const { id } = await params`
  * `const sp = await searchParams`
  * `const h = await headers()`

### 10.3 “Missing Required default.js for Parallel Route”

* Add `default.tsx` to every `@slot` directory at each relevant segment.

### 10.4 “Works locally, fails on Vercel”

* Confirm Node major version alignment (local vs Vercel).
* Run `vercel build` locally.
* Confirm lockfile and package manager are consistent.

---

## 11) What the agent must not do

* Do not re-introduce `next lint`.
* Do not add Client Components everywhere “just in case”.
* Do not access secrets in client code.
* Do not ignore Next.js error pages; fix root causes.
* Do not introduce custom webpack config unless explicitly required and tested.

## 12) Front end design skills
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.

---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## 13) Quick start checklist (agent)

1. Write `.nvmrc` = `24`; install Node 24. 
2. Create `package.json` with exact versions above; add scripts.
3. Add `tsconfig.json`, `eslint.config.mjs`, `prettier.config.mjs`, `.prettierignore`.
4. Scaffold `/app` with `layout.tsx` and `page.tsx`.
5. Optionally add `src/proxy.ts` for request interception. 
6. Run: `pnpm i` → `pnpm typecheck` → `pnpm lint` → `pnpm dev`.
7. Enable Vercel Git integration; confirm Node 24.x in settings; set env vars; push to `main`. 
8. Your front end design must be excptional - use the Front end design skills described above (in 12)

