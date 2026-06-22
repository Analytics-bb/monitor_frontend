import type { ReactNode } from 'react'
import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

import { Sidebar } from './Sidebar'

export interface AppLayoutProps {
  /** Слот Login/Logout для Sidebar (module-6). */
  authSlot?: ReactNode
}

/**
 * Shell приложения: Sidebar, область контента и глобальный Toaster.
 *
 * @param props.authSlot - Слот Login/Logout (реализация в module-6)
 */
export function AppLayout({ authSlot }: AppLayoutProps) {
  return (
    <div className="bg-background text-foreground flex min-h-svh">
      <Sidebar authSlot={authSlot} />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
      <Toaster richColors closeButton position="top-right" />
    </div>
  )
}
