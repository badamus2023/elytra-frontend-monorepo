import { createWorkspaceAuth } from '@drones/shared/auth/workspace'

export const workspaceAuth = createWorkspaceAuth('restaurantOwner')

export const { getRole, setRole, clearRole, getUserName, setUserName } = workspaceAuth
