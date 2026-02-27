// ── API DTOs — mirrors backend OpenAPI contract (contracts/openapi.yaml) ──

export type GameStatus = 'ongoing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned'
export type GameResult = '1-0' | '0-1' | '1/2-1/2'

/** Full game object as returned by every endpoint. */
export interface Game {
  game_id: string
  status: GameStatus
  result: GameResult | null
  fen: string
  side_to_move: 'white' | 'black'
  ply_count: number
  last_move_uci: string | null
  last_move_at: string | null
  state_version: number
  created_at: string
  updated_at: string
}

export interface Assignment {
  assignment_id: string
  assigned_at: string
}

/** GET /api/v1/games/assigned */
export interface AssignedGameResponse {
  game: Game
  assignment: Assignment
}

export interface MoveRecord {
  move_id: string
  uci: string
  fen_before: string
  fen_after: string
  created_at: string
}

/** POST /api/v1/games/{game_id}/moves — request body */
export interface SubmitMoveRequest {
  uci: string
  expected_version: number
  client_nonce?: string
}

/** POST /api/v1/games/{game_id}/moves — success (200) */
export interface SubmitMoveResponse {
  accepted: true
  move: MoveRecord
  game: Game
  next_assignment_hint?: {
    should_fetch_next: boolean
    reason?: string
  }
}

// ── Error shapes (RFC 7807 Problem Details) ───────────────────────────────

export interface ProblemDetail {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
}

export type MoveErrorCode =
  | 'illegal_move'
  | 'invalid_uci'
  | 'game_not_ongoing'
  | 'one_move_limit'

/** 422 move error — extends ProblemDetail with code + optional current game. */
export interface MoveErrorDetail extends ProblemDetail {
  code: MoveErrorCode
  game?: Game
}

// ── UI-level intent (board → hook) ────────────────────────────────────────

/**
 * What the board emits on piece drop.
 * The hook converts this to a UCI string before calling the API.
 */
export interface DropIntent {
  from: string
  to: string
  promotion?: string
}
