const KEY = 'random-chess-client-token'

/** Returns a stable per-browser token stored in localStorage. Used as X-Client-Token. */
export function getClientToken(): string {
  let token = localStorage.getItem(KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(KEY, token)
  }
  return token
}
