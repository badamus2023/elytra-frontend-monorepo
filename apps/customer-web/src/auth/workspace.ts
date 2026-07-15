import { createWorkspaceAuth } from '@drones/shared/auth/workspace'
import { getAccessToken } from '@drones/shared/auth/session'

export const workspaceAuth = createWorkspaceAuth('customer')

export const { getRole, setRole, clearRole, getUserName, setUserName, getCustomerId, setCustomerId } =
  workspaceAuth

export function isCustomerAuthenticated(): boolean {
  return getRole() === 'customer' && Boolean(getAccessToken())
}
