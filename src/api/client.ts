import { getClientToken } from '../utils/clientToken'
import type { ProblemDetail } from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// ── Typed error classes ───────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetail,
  ) {
    super(problem.detail || problem.title)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(public readonly originalCause: unknown) {
    super('Unable to reach the server')
    this.name = 'NetworkError'
  }
}

// ── Base fetch wrapper ────────────────────────────────────────────────────

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Token': getClientToken(),
      },
    })
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(
        '[random-chess] Network error — is VITE_API_URL correct? Is the server allowing CORS?',
        err,
      )
    }
    throw new NetworkError(err)
  }

  if (!res.ok) {
    let problem: ProblemDetail
    try {
      problem = (await res.json()) as ProblemDetail
    } catch {
      problem = {
        type: 'about:blank',
        title: res.statusText || 'Unknown Error',
        status: res.status,
        detail: `HTTP ${res.status}`,
      }
    }
    throw new ApiError(res.status, problem)
  }

  return res.json() as Promise<T>
}
