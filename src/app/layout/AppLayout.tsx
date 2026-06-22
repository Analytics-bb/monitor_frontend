import type { ReactNode } from 'react'
import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'

export interface AppLayoutProps {
  /** Слот Login/Logout для Sidebar (module-6). */
  authSlot?: ReactNode
}

/**
 * Shell приложения: Sidebar + content area.
 */
export function AppLayout({ authSlot }: AppLayoutProps) {
  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <Sidebar authSlot={authSlot} />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
