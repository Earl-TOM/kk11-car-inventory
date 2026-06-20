# AI Rules for AutoTrade Inventory

## Tech Stack (Snapshot)
- **Vite + React 19 + TypeScript** for the frontend application structure and development workflow.
- **React Router** for all client-side routing, with routes centralized in `src/App.tsx`.
- **Firebase Authentication** for Google sign-in and session handling.
- **Cloud Firestore** as the primary realtime database for inventory and admin records.
- **react-firebase-hooks** for auth state subscriptions in React components.
- **Tailwind CSS v4** for all styling and responsive layout implementation.
- **Lucide React** for icons across navigation, cards, and admin UI.
- **Motion (`motion/react`)** for UI animations and transitions.
- **Utility styling helpers (`clsx` + `tailwind-merge`)** via `cn()` from `src/lib/utils.ts`.

## Library Usage Rules

### Core Framework
1. Use **React + TypeScript** for all new UI logic.
2. Keep route definitions in **`src/App.tsx`** using **React Router**.
3. Put pages in **`src/pages/`** and reusable UI pieces in **`src/components/`**.

### Data & Auth
4. Use **Firebase Auth** from `src/lib/firebase.ts` for sign-in/sign-out only.
5. Use **Firestore** for all persistent app data (cars/admin checks), through service modules like `src/services/carService.ts`.
6. Do not bypass service modules from page components unless a very small read/write helper is required.

### Styling & UI
7. Use **Tailwind CSS** for all styling; prefer utility classes over custom CSS.
8. Use `cn()` from `src/lib/utils.ts` when composing conditional class names.
9. Use **Lucide React** for icons; do not introduce a second icon library.
10. Use **Motion** only for purposeful UI animation (entry transitions, subtle interactions), not for core logic.

### Components & Patterns
11. Keep components focused and reasonably small; create a new file for each new component.
12. Prefer controlled inputs and local component state for forms (`useState` + typed models).
13. Reuse existing domain types from `src/types.ts`; avoid redefining entity shapes in components.

### Dependencies & Consistency
14. Do not add new libraries when existing project libraries already solve the problem.
15. If a new dependency is truly necessary, keep it minimal and aligned with the existing stack conventions.
16. Preserve the current architecture style (service layer for Firestore, typed models, Tailwind-first UI).

<!-- nitro:start -->

## Nitro Server Layer

This project has a Nitro server layer for backend API routes. A `nitro.config.ts` at the app root sets `serverDir: "./server"` — do not move or remove it.

### vite.config.ts

`vite.config.ts` already imports `nitro` from `"nitro/vite"` and registers `nitro()` as the LAST entry in the `plugins` array. Do not move it earlier — it must run after Vite's module-transform middleware, otherwise Nitro's SPA fallback intercepts Vite internal URLs (`/src/*.tsx`, `/@vite/client`, `/@react-refresh`, `/@fs/*`) and returns `index.html`, breaking the preview.

### API Route Conventions

- Write routes in `server/routes/api/` (NEVER top-level `/api/`).
- Dynamic routes: `[param].ts`. Method-specific: `hello.get.ts`, `hello.post.ts`.
- Runtime config: `useRuntimeConfig()` (env vars prefixed with `NITRO_`).

### Imports — read carefully

Imports come from two different sources:

- `defineHandler` and `useRuntimeConfig` are imported from **`"nitro"`**.
- **Every request/response helper comes from `"nitro/h3"`** — Nitro v3 re-exports h3 utilities through that subpath. Common ones: `readBody`, `readValidatedBody`, `getQuery`, `getRouterParam`, `getRouterParams`, `createError`, `sendError`, `setResponseStatus`, `getRequestHeaders`, `getRequestURL`, `setCookie`, `getCookie`, `deleteCookie`.

Worked example — `server/routes/api/todos.post.ts`:

```ts
import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ title?: string }>(event);
  if (!body?.title) {
    throw createError({ statusCode: 400, statusMessage: "title is required" });
  }
  return { ok: true, title: body.title };
});
```

### Server-side packages

Any package used inside `server/` (database drivers like `@neondatabase/serverless`, auth SDKs, third-party API clients) must be in `package.json`. Add it before writing the first server file that imports it. NEVER import these from `src/` — code under `src/` ships to the browser, so importing server packages there leaks them and usually breaks the build.

### Common mistakes

- `import { readBody } from "nitro"` → wrong. h3 utilities are not exported from `"nitro"`. Use `"nitro/h3"`.
- `import { readBody } from "h3"` → wrong. Even though Nitro is built on h3, you import through `"nitro/h3"` (the version Nitro re-exports), not `"h3"` directly.
- `nitro()` placed before `react()` in `plugins` → wrong. Must be the LAST entry, otherwise the SPA fallback intercepts Vite internals.
- Omitting `nitro()` from `vite.config.ts` entirely → `/api/*` returns `index.html` instead of JSON.
- Importing server-only packages or referencing server-only env vars (`process.env.DATABASE_URL`, secrets) from `src/` → wrong. The Vite client bundle is public; this leaks them. Server code lives in `server/` only.

<!-- nitro:end -->
