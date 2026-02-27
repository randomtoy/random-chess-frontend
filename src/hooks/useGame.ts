import { useReducer, useCallback, useEffect } from 'react'
import { getAssigned, submitMove as apiSubmitMove } from '../api/endpoints'
import { ApiError, NetworkError } from '../api/client'
import type { Game, DropIntent, MoveErrorDetail } from '../api/types'

// ── State machine ─────────────────────────────────────────────────────────

/**
 * loading — fetching a game or waiting for move response
 * ready   — game loaded; may also hold a move error inline
 * error   — fatal: could not load a game at all
 */
type Phase = 'loading' | 'ready' | 'error'

interface GameHookState {
  phase: Phase
  game: Game | null
  /** Inline error shown in the control panel without losing the board. */
  error: string | null
  /** True after a successful move — board is locked until user requests next game. */
  movePlayed: boolean
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; game: Game }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'MOVE_START' }
  | { type: 'MOVE_SUCCESS'; game: Game }
  /** Move rejected — keep board visible; optionally update game state from error body. */
  | { type: 'MOVE_ERROR'; error: string; game?: Game; movePlayed?: boolean }

const initial: GameHookState = {
  phase: 'loading',
  game: null,
  error: null,
  movePlayed: false,
}

function reducer(state: GameHookState, action: Action): GameHookState {
  switch (action.type) {
    case 'FETCH_START':
      return { phase: 'loading', game: null, error: null, movePlayed: false }
    case 'FETCH_SUCCESS':
      return { phase: 'ready', game: action.game, error: null, movePlayed: false }
    case 'FETCH_ERROR':
      return { phase: 'error', game: null, error: action.error, movePlayed: false }
    case 'MOVE_START':
      return { ...state, phase: 'loading', error: null }
    case 'MOVE_SUCCESS':
      return { phase: 'ready', game: action.game, error: null, movePlayed: true }
    case 'MOVE_ERROR':
      // Stay in 'ready' — board stays visible so user can try a different move
      return {
        ...state,
        phase: 'ready',
        game: action.game ?? state.game,
        error: action.error,
        movePlayed: action.movePlayed ?? state.movePlayed,
      }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function dropToUCI(drop: DropIntent): string {
  return `${drop.from}${drop.to}${drop.promotion ?? ''}`
}

function toFriendlyError(err: unknown): string {
  if (err instanceof NetworkError) {
    const hint = import.meta.env.DEV
      ? ' (Check VITE_API_URL and server CORS settings.)'
      : ''
    return `Unable to reach the server.${hint}`
  }
  if (err instanceof ApiError) {
    const detail = err.problem as Partial<MoveErrorDetail>
    switch (detail.code) {
      case 'illegal_move':      return "That move isn't legal in this position."
      case 'invalid_uci':       return 'Invalid move format.'
      case 'game_not_ongoing':  return 'This game has already ended.'
      case 'one_move_limit':    return "You've already made your move in this game."
    }
    if (err.status === 409) return 'The position changed — please try again.'
    if (err.status === 429) return 'Too many requests — wait a moment and retry.'
    return err.problem.detail || err.problem.title || 'Something went wrong.'
  }
  return 'An unexpected error occurred.'
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initial)

  const fetchAssigned = useCallback(async () => {
    dispatch({ type: 'FETCH_START' })
    try {
      const { game } = await getAssigned()
      dispatch({ type: 'FETCH_SUCCESS', game })
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: toFriendlyError(err) })
    }
  }, [])

  // Auto-load on mount
  useEffect(() => {
    void fetchAssigned()
  }, [fetchAssigned])

  const submitMove = useCallback(
    async (drop: DropIntent) => {
      if (!state.game) return
      const uci = dropToUCI(drop)
      dispatch({ type: 'MOVE_START' })
      try {
        const result = await apiSubmitMove(state.game.game_id, {
          uci,
          expected_version: state.game.state_version,
          client_nonce: crypto.randomUUID(),
        })
        dispatch({ type: 'MOVE_SUCCESS', game: result.game })
      } catch (err) {
        // Version conflict (409) — game state changed under us; re-fetch
        if (err instanceof ApiError && err.status === 409) {
          void fetchAssigned()
          return
        }
        // one_move_limit — backend may include current game state; lock board
        let gameFromError: Game | undefined
        let movePlayed: boolean | undefined
        if (err instanceof ApiError) {
          const detail = err.problem as Partial<MoveErrorDetail>
          if (detail.code === 'one_move_limit') {
            gameFromError = detail.game
            movePlayed = true
          }
        }
        dispatch({
          type: 'MOVE_ERROR',
          error: toFriendlyError(err),
          game: gameFromError,
          movePlayed,
        })
      }
    },
    [state.game, fetchAssigned],
  )

  return {
    phase: state.phase,
    game: state.game,
    error: state.error,
    movePlayed: state.movePlayed,
    fetchAssigned,
    submitMove,
  }
}
