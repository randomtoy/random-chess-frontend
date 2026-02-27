import { StatusChip } from './ui/StatusChip'
import type { Game } from '../api/types'

interface GameStatusProps {
  game: Game
}

export function GameStatus({ game }: GameStatusProps) {
  if (game.status !== 'ongoing') {
    const label = game.result ?? game.status
    return <StatusChip label={label} variant="warning" />
  }

  const label = game.side_to_move === 'white' ? 'White to move' : 'Black to move'
  return <StatusChip label={label} variant="success" />
}
