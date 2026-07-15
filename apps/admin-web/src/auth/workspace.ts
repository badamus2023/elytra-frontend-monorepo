import { createWorkspaceAuth } from '@drones/shared/auth/workspace'

export const workspaceAuth = createWorkspaceAuth('admin')

export const { getRole, setRole, clearRole, getUserName, setUserName } = workspaceAuth
