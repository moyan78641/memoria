import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export function AppLayout() {
  useEffect(() => {
    document.title = localStorage.getItem('site_name') || 'MemorialHub'
  }, [])

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 pt-14 md:p-6 md:pt-6">
        <Outlet />
      </main>
    </div>
  )
}
