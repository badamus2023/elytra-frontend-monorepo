import { withAuth } from '../api/withAuth'
import { clearSessionAndNotify, refreshSession } from './refreshSession'

type InstallAuthFetchOptions = {
  onSessionExpired?: () => void
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

function shouldAttemptRefresh(url: string): boolean {
  if (!url.includes('/api/')) return false
  if (url.includes('/api/auth/login')) return false
  if (url.includes('/api/auth/register')) return false
  if (url.includes('/api/auth/refresh')) return false
  if (url.includes('/api/auth/forgot-password')) return false
  if (url.includes('/api/auth/reset-password')) return false
  if (url.includes('/api/auth/verify-email')) return false
  return true
}

function mergeAuthHeaders(
  input: RequestInfo | URL,
  init?: RequestInit,
): RequestInit {
  const authInit = withAuth(init)
  const headers = new Headers(authInit.headers)

  if (input instanceof Request) {
    input.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'authorization') {
        headers.set(key, value)
      }
    })
  }

  return { ...authInit, headers }
}

let installed = false

export function installAuthFetchInterceptor(
  options: InstallAuthFetchOptions = {},
): void {
  if (installed || typeof globalThis.fetch !== 'function') {
    return
  }

  installed = true
  const nativeFetch = globalThis.fetch.bind(globalThis)

  globalThis.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const response = await nativeFetch(input, init)
    const url = resolveUrl(input)

    if (response.status !== 401 || !shouldAttemptRefresh(url)) {
      return response
    }

    const retried = init?.headers instanceof Headers
      ? init.headers.get('x-auth-retry') === '1'
      : (init?.headers as Record<string, string> | undefined)?.['x-auth-retry'] === '1'

    if (retried) {
      clearSessionAndNotify(options.onSessionExpired)
      return response
    }

    const refreshed = await refreshSession()
    if (!refreshed) {
      clearSessionAndNotify(options.onSessionExpired)
      return response
    }

    const retryHeaders = new Headers(mergeAuthHeaders(input, init).headers)
    retryHeaders.set('x-auth-retry', '1')

    const retryInit: RequestInit = {
      ...init,
      headers: retryHeaders,
    }

    if (input instanceof Request) {
      return nativeFetch(new Request(input, retryInit))
    }

    return nativeFetch(input, retryInit)
  }
}
