import { clearSession } from './session'

export type WorkspaceKind = 'customer' | 'admin' | 'restaurantOwner'

export type WorkspaceAuth = {
  getRole: () => WorkspaceKind | null
  setRole: (role: WorkspaceKind) => void
  clearRole: () => void
  getUserName: () => string
  setUserName: (name: string) => void
  getCustomerId: () => number
  setCustomerId: (id: number) => void
}

export function createWorkspaceAuth(kind: WorkspaceKind): WorkspaceAuth {
  const ROLE_KEY = `drone-ui-role-${kind}`
  const CUSTOMER_KEY = `drone-ui-customer-id-${kind}`
  const USER_KEY = `drone-ui-user-name-${kind}`

  return {
    getRole() {
      const role = localStorage.getItem(ROLE_KEY)
      if (
        role === 'customer' ||
        role === 'admin' ||
        role === 'restaurantOwner'
      ) {
        return role
      }
      return null
    },

    setRole(role: WorkspaceKind) {
      localStorage.setItem(ROLE_KEY, role)
    },

    clearRole() {
      clearSession()
      localStorage.removeItem(ROLE_KEY)
      localStorage.removeItem(CUSTOMER_KEY)
      localStorage.removeItem(USER_KEY)
    },

    getCustomerId() {
      const value = localStorage.getItem(CUSTOMER_KEY)
      const parsed = value ? Number(value) : NaN
      return Number.isFinite(parsed) ? parsed : 1
    },

    setCustomerId(id: number) {
      localStorage.setItem(CUSTOMER_KEY, String(id))
    },

    getUserName() {
      return localStorage.getItem(USER_KEY) ?? defaultName(kind)
    },

    setUserName(name: string) {
      localStorage.setItem(USER_KEY, name)
    },
  }
}

function defaultName(kind: WorkspaceKind): string {
  switch (kind) {
    case 'admin':
      return 'Alex Admin'
    case 'restaurantOwner':
      return 'Restaurant Owner'
    case 'customer':
      return 'Casey Customer'
  }
}

export function rolesAllowedForWorkspace(
  workspace: WorkspaceKind,
  apiRoles: string[],
): boolean {
  const lower = apiRoles.map((r) => r.toLowerCase())
  const isAdmin = lower.includes('admin')
  const isUser = lower.includes('user')
  const isRestaurantOwner = lower.includes('restaurantowner')

  if (workspace === 'customer') return isUser
  if (workspace === 'restaurantOwner') {
    return isRestaurantOwner || isAdmin
  }
  if (workspace === 'admin') return isAdmin
  return false
}
