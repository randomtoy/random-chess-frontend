import { request } from './client'
import type { AssignedGameResponse, SubmitMoveRequest, SubmitMoveResponse } from './types'

/** GET /api/v1/games/assigned — returns the game assigned to this client. */
export function getAssigned(): Promise<AssignedGameResponse> {
  return request<AssignedGameResponse>('/api/v1/games/assigned')
}

/** POST /api/v1/games/{game_id}/moves — submit a move intent. */
export function submitMove(
  gameId: string,
  body: SubmitMoveRequest,
): Promise<SubmitMoveResponse> {
  return request<SubmitMoveResponse>(`/api/v1/games/${gameId}/moves`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
