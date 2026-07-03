import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { LoginPage } from './login-page'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <h1 className="text-xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm">
            Your account does not have admin privileges.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
