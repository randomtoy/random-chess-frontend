import { GlassPanel } from '../components/ui/GlassPanel'
import { Button } from '../components/ui/Button'
import { StatusChip } from '../components/ui/StatusChip'
import { Spinner } from '../components/ui/Spinner'
import { Board } from '../components/Board'
import { GameStatus } from '../components/GameStatus'
import { useGame } from '../hooks/useGame'
import type { DropIntent } from '../api/types'
import styles from './GamePage.module.css'

const FALLBACK_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export function GamePage() {
  const { phase, game, error, movePlayed, fetchAssigned, submitMove } = useGame()

  const fen = game?.fen ?? FALLBACK_FEN
  const isFinished = !!game && game.status !== 'ongoing'

  // Board is interactive only when a game is ready, ongoing, and the move hasn't been made
  const boardInteractive = phase === 'ready' && !!game && !isFinished && !movePlayed

  function handleMove(drop: DropIntent) {
    if (!boardInteractive) return
    void submitMove(drop)
  }

  // ── Derived display state ──────────────────────────────────────────────
  // loading with no game  → full-page spinner (initial load)
  // loading with game     → board + loading overlay (move in flight)
  // ready                 → board + status + optional inline error
  // error                 → board (placeholder) + fatal error + retry

  const boardLoading = phase === 'loading' && !!game
  const isInitialLoad = phase === 'loading' && !game
  const isFatalError  = phase === 'error'

  return (
    <div className={styles.page}>

      {/* ── Fixed top bar ─────────────────────────────────────── */}
      <header className={styles.topBar}>
        <GlassPanel className={styles.topBarInner}>
          <span className={styles.logo}>Random Chess</span>

          {game && (
            <div className={styles.topBarRight}>
              <span className={styles.gameId}>{game.game_id.slice(0, 8)}</span>
              <StatusChip
                label={
                  game.status !== 'ongoing'
                    ? game.status
                    : game.side_to_move === 'white' ? 'White' : 'Black'
                }
                variant={game.status !== 'ongoing' ? 'warning' : 'success'}
              />
            </div>
          )}
        </GlassPanel>
      </header>

      {/* ── Board + controls ──────────────────────────────────── */}
      <main className={styles.main}>

        <div className={styles.boardContainer}>
          <Board
            fen={fen}
            loading={boardLoading || isInitialLoad}
            finished={isFinished || movePlayed}
            onMove={handleMove}
          />
        </div>

        {/* Floating control panel */}
        <GlassPanel className={[
          styles.controlPanel,
          // Shake on inline move error only (not fatal fetch error)
          (phase === 'ready' && !!error) ? styles.shake : '',
        ].filter(Boolean).join(' ')}>

          {/* ── Initial load ── */}
          {isInitialLoad && (
            <span className={styles.hint}>
              <Spinner size={14} />
              Finding a game…
            </span>
          )}

          {/* ── Fatal error (couldn't load a game) ── */}
          {isFatalError && (
            <>
              <span className={styles.errorText}>{error}</span>
              <Button variant="ghost" onClick={() => void fetchAssigned()}>Retry</Button>
            </>
          )}

          {/* ── Game loaded — show status / actions ── */}
          {!!game && (
            <>
              {/* Inline move error */}
              {error && (
                <span className={styles.errorText}>{error}</span>
              )}

              {/* Normal status — no error, move not yet played */}
              {!error && !movePlayed && (
                <GameStatus game={game} />
              )}

              {/* Move in flight */}
              {phase === 'loading' && !error && (
                <span className={styles.hint}>Processing…</span>
              )}

              {/* After a move or finished — offer next game */}
              {(movePlayed || isFinished) && (
                <Button onClick={() => void fetchAssigned()}>Next game</Button>
              )}

              {/* Inline error with option to try a different game instead */}
              {error && !movePlayed && (
                <Button variant="ghost" onClick={() => void fetchAssigned()}>New game</Button>
              )}
            </>
          )}

        </GlassPanel>
      </main>

    </div>
  )
}
