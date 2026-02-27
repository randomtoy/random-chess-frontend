import { useEffect, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Spinner } from './ui/Spinner'
import type { DropIntent } from '../api/types'
import styles from './Board.module.css'

interface BoardProps {
  fen: string
  loading?: boolean
  finished?: boolean
  onMove: (drop: DropIntent) => void
}

const DARK_SQ_STYLE = {
  background: 'linear-gradient(145deg, #090f1d, #060c16)',
}

const LIGHT_SQ_STYLE = {
  background: 'linear-gradient(145deg, rgba(148, 162, 210, 0.14), rgba(108, 122, 175, 0.08))',
}

const DROP_SQ_STYLE = {
  background: 'rgba(196, 162, 74, 0.09)',
  boxShadow: 'inset 0 0 0 1.5px rgba(196, 162, 74, 0.42)',
}

export function Board({ fen, loading = false, finished = false, onMove }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [boardWidth, setBoardWidth] = useState(480)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setBoardWidth(el.offsetWidth)
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setBoardWidth(Math.floor(entry.contentRect.width))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Clear last-move highlight when a new game starts (finished resets to false)
  useEffect(() => {
    if (!finished && !loading) setLastMove(null)
  }, [fen]) // eslint-disable-line react-hooks/exhaustive-deps

  function handlePieceDrop(sourceSquare: string, targetSquare: string, piece: string): boolean {
    const isPromotion =
      (piece === 'wP' && targetSquare[1] === '8') ||
      (piece === 'bP' && targetSquare[1] === '1')
    setLastMove({ from: sourceSquare, to: targetSquare })
    onMove({
      from: sourceSquare,
      to: targetSquare,
      ...(isPromotion ? { promotion: 'q' } : {}),
    })
    // Board always reverts — server is the source of truth
    return false
  }

  const lastMoveStyles = lastMove
    ? {
        [lastMove.from]: { background: 'rgba(196, 162, 74, 0.09)' },
        [lastMove.to]:   { background: 'rgba(196, 162, 74, 0.19)' },
      }
    : {}

  const disabled = loading || finished
  const wrapperClass = [styles.wrapper, finished ? styles.finished : ''].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass} ref={containerRef}>
      <Chessboard
        position={fen}
        boardWidth={boardWidth}
        onPieceDrop={disabled ? undefined : handlePieceDrop}
        arePiecesDraggable={!disabled}
        animationDuration={220}
        customDarkSquareStyle={DARK_SQ_STYLE}
        customLightSquareStyle={LIGHT_SQ_STYLE}
        customDropSquareStyle={DROP_SQ_STYLE}
        customSquareStyles={lastMoveStyles}
        customBoardStyle={{ background: 'transparent', borderRadius: '4px' }}
      />
      {loading && (
        <div className={styles.overlay}>
          <Spinner size={40} />
        </div>
      )}
    </div>
  )
}
