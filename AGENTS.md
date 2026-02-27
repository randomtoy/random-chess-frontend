# Random Chess Frontend (Codex)

Goal UX: assigned game -> 1 move -> switch to next assigned game.

Contracts:
- openapi.yaml in random-chess-contract is source of truth.
- Do not invent API fields. If needed: change contract repo first.

Rules:
- Never mention AI/Claude/Codex in code, docs, commits, PR text.
- Do not add new prompt/AI files beyond existing repo set.
- Never validate chess legality in UI; server authoritative.
- Small diffs; no redesign unless requested.

UX:
- 200 accepted: render response state, then fetch next assigned game
- 422 rejected: show error, stay on same game, allow retry
- 409 conflict: refresh game, allow retry
- clean loading/error states