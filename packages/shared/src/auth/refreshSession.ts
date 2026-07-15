import type { AuthResponse } from '../api/model'
import { getRefreshToken, setSession, clearSession } from './session'

let refreshPromise: Promise<boolean> | null = null

export async function refreshSession(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      return false
    }

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!res.ok) {
        return false
      }

      const auth = (await res.json()) as AuthResponse
      if (!auth.accessToken) {
        return false
      }

      setSession(auth)
      return true
    } catch {
      return false
    }
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

export function clearSessionAndNotify(onSessionExpired?: () => void): void {
  clearSession()
  onSessionExpired?.()
}
