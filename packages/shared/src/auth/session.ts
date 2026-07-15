import type { AuthResponse } from '../api/model'

const ACCESS_TOKEN_KEY = 'drone-ui-access-token'
const REFRESH_TOKEN_KEY = 'drone-ui-refresh-token'
const USER_JSON_KEY = 'drone-ui-auth-user'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setSession(auth: AuthResponse): void {
  if (auth.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken)
  }
  if (auth.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken)
  }
  if (auth.user) {
    localStorage.setItem(USER_JSON_KEY, JSON.stringify(auth.user))
  }
}

export function getSessionUser(): AuthResponse['user'] | null {
  const raw = localStorage.getItem(USER_JSON_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthResponse['user']
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_JSON_KEY)
}

export function hasApiRole(roleName: string): boolean {
  const user = getSessionUser()
  const target = roleName.toLowerCase()
  return (
    user?.roles?.some((r) => r.toLowerCase() === target) ?? false
  )
}
