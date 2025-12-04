# Repository Guidelines

## Project Structure & Module Organization
- Core game code lives in `src/` (Phaser scenes, entities, managers, config, services, utils).
- Static assets and HTML shell are in `public/` and `index.html`; generated build output goes to `dist/`.
- Design docs and checklists sit in `docs/`; asset generator tooling is under `tools/asset-generator/`.
- Firebase hosting/config and (if used) Cloud Functions are in `firebase.json`, `firestore.*`, and `functions/`.
- TypeScript path aliases (e.g., `@scenes/*`, `@config/*`) are defined in `tsconfig.json` and mirrored in `vite.config.ts`.

## Build, Test, and Development Commands
- `npm run dev` — launch Vite dev server (Phaser game) with HMR.
- `npm run build` — typecheck (`tsc --noEmit`) then bundle via Vite.
- `npm run build:prod` — production-mode Vite build.
- `npm run preview` — serve the production build locally.
- `npm run lint` / `npm run lint:fix` — run ESLint (and auto-fix).
- `npm run typecheck` — strict TypeScript checking without emit.
- `npm run clean` — remove `dist/`.

## Coding Style & Naming Conventions
- Language: TypeScript (ES2022 target), strict mode on; Phaser 3 game framework.
- Linting/formatting: ESLint + Prettier; avoid disabling rules without justification.
- Modules use path aliases; prefer absolute imports (`@entities/Cat`) over relative where available.
- Naming: PascalCase for classes/components (`GameScene`), camelCase for functions/vars, SCENE_KEYS/consts in ALL_CAPS.
- Keep code ASCII; add short comments only where logic is non-obvious.

## Testing Guidelines
- No automated test suite is present; rely on `npm run typecheck` and `npm run lint` before pushes.
- For gameplay changes, sanity-check via `npm run dev` and exercise jump/landing flows to ensure stacking and game-over still work.

## Commit & Pull Request Guidelines
- Use clear, imperative commit messages (e.g., “Fix landing collision gating”, “Add gift can rewards”).
- PRs should describe scope, risk areas, and manual test steps (what you clicked/verified). Include screenshots/GIFs for UI/FX changes when possible.
- Link related issues/tasks. Keep unrelated refactors out of feature/fix PRs.

## Security & Configuration Tips
- Do not commit secrets; Firebase config is injected via `VITE_FIREBASE_*` env vars and written to `public/firebase-config.js` during build.
- If working with Firebase Functions, run them locally with your own credentials; keep `functions/.env` out of source control.
