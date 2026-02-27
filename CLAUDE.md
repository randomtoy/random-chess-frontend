# random-chess-frontend — CLAUDE.md

## Goal
This repo contains ONLY the web UI for Random Chess.
Focus on UX, UI state, and typed API integration. Keep changes incremental.

## Tech stack
Follow the repo’s existing setup (Next/Vite, styling, linting, tests). Do not introduce new frameworks unless asked.

## Architecture boundaries
Backend is the single source of truth for:
- game state
- move legality
- game status/result

Frontend responsibilities:
- render server-provided state
- collect user intent (e.g., a move) and send it to backend
- show loading/error/empty states
- handle transitions between games

Do NOT implement chess rules/engines in the frontend.

## Chessboard rendering
Use a visual chessboard renderer only (UI component).
Preferred approach:
- render position from server-provided FEN
- on user move, send intent `{ from, to, promotion? }`
- rerender from server response

No client-side legality validation (at most UI hints). Server decides.

## API contract rules
- All HTTP calls go through a small typed API client layer (e.g., `src/api/*`).
- Keep DTO/types isolated (e.g., `src/api/types.ts`).
- If an OpenAPI/contract exists in the repo, use it. Otherwise define minimal DTOs.

## State & UX rules
Always support deterministic UI states:
- idle / loading / error / ready

Must handle:
- getting a game to play (create/join/next)
- submitting exactly one move
- switching the user to another game after submitting a move
- finished game display (result/status)

## Repo boundaries (important)
This is a frontend repo:
- No backend implementation code here.
- No database logic here.

## Infrastructure (Docker/Helm/CI)
Infrastructure is ALLOWED but must be isolated:
- Deployment artifacts MUST live under `/deployment/*` only.
- Do not mix infra with app code.
- Create/update infra ONLY when explicitly requested.

## Code quality
- TypeScript strict; avoid `any`.
- Keep components small; prefer composition.
- Follow existing formatting/lint rules in the repo.

## When uncertain
Inspect the existing structure and conventions first.
Prefer smaller, PR-style changes over large refactors.