import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { installAuthFetchInterceptor } from '@drones/shared/auth/installAuthFetchInterceptor'
import './index.css'
import App from './App.tsx'
import { clearRole } from './auth/workspace'

document.documentElement.classList.add('dark')

installAuthFetchInterceptor({
  onSessionExpired: () => {
    clearRole()
    const path = window.location.pathname
    if (!path.startsWith('/login') && !path.startsWith('/register')) {
      window.location.assign('/login')
    }
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
