import { postApiAuthRefresh } from '../api/client'
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
      const res = await postApiAuthRefresh({ refreshToken })
      if (res.status < 200 || res.status >= 300) {
        return false
      }

      const auth = res.data
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
