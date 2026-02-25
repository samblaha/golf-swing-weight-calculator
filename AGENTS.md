# AGENTS.md

## Cursor Cloud specific instructions

This is a client-side-only React + TypeScript SPA (no backend, no database). All state persists in browser `localStorage`.

### Single service

| Service | Command | Port |
|---------|---------|------|
| Vite dev server | `npm run dev` | 5173 |

### Standard commands (see `package.json` scripts)

- **Lint:** `npm run lint`
- **Test:** `npm run test` (Vitest, pure unit tests in `src/lib/swingweight.test.ts`)
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Dev:** `npm run dev` (Vite with HMR)

### Notes

- No `.env` files, no secrets, no Docker, and no external services are required.
- The Vite dev server binds to `localhost:5173` by default.
- Tests are fast (~200ms) and have no external dependencies.
