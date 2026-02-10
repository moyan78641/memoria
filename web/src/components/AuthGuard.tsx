import { Navigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loggedIn } = useAuth()

  if (!loggedIn) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
