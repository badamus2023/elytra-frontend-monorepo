import { createContext, useContext, type ReactNode } from 'react'
import type { WorkspaceAuth } from './workspace'

const WorkspaceAuthContext = createContext<WorkspaceAuth | null>(null)

type WorkspaceAuthProviderProps = {
  auth: WorkspaceAuth
  children: ReactNode
}

export function WorkspaceAuthProvider({
  auth,
  children,
}: WorkspaceAuthProviderProps) {
  return (
    <WorkspaceAuthContext.Provider value={auth}>
      {children}
    </WorkspaceAuthContext.Provider>
  )
}

export function useWorkspaceAuth(): WorkspaceAuth {
  const auth = useContext(WorkspaceAuthContext)
  if (!auth) {
    throw new Error('useWorkspaceAuth must be used within WorkspaceAuthProvider')
  }
  return auth
}
