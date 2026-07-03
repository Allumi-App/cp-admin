import { Outlet } from 'react-router'
import { Sidebar } from './sidebar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-8 pb-8 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
