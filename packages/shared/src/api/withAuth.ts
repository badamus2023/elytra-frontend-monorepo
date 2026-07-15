import { getAccessToken } from '../auth/session'

export function withAuth(init?: RequestInit): RequestInit {
  const token = getAccessToken()
  const merged: Record<string, string> = {}

  const h = init?.headers
  if (h instanceof Headers) {
    h.forEach((value, key) => {
      merged[key] = value
    })
  } else if (h && typeof h === 'object' && !Array.isArray(h)) {
    for (const [key, value] of Object.entries(h as Record<string, unknown>)) {
      if (value != null) merged[key] = String(value)
    }
  }

  if (token) {
    merged.Authorization = `Bearer ${token}`
  }

  return { ...init, headers: merged }
}

export function assertOk(
  status: number,
  data: unknown,
  fallbackMessage: string,
): void {
  if (status >= 200 && status < 300) return
  let message = fallbackMessage
  if (typeof data === 'object' && data !== null) {
    const rec = data as Record<string, unknown>
    if (typeof rec.message === 'string') message = rec.message
    else if (typeof rec.Message === 'string') message = rec.Message
    else if (typeof rec.title === 'string') message = rec.title
  }
  throw new Error(message)
}
