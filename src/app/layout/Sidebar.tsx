import type { ReactNode } from 'react'
import { NavLink } from 'react-router'

import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { to: '/monitoring', label: 'Мониторинг' },
  { to: '/deep', label: 'Deep' },
  { to: '/usage', label: 'Usage' },
  { to: '/settings/agents', label: 'Настройки' },
  { to: '/cabinet', label: 'Кабинет' },
] as const

export interface SidebarProps {
  /** Слот Login/Logout; реализация session — module-6. */
  authSlot?: ReactNode
}

/**
 * Боковая навигация M17 + theme toggle и auth slot.
 */
export function Sidebar({ authSlot }: SidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">BB Anomaly</p>
        <p className="text-xs text-muted-foreground">Monitor</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2" aria-label="Основная навигация">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center justify-between gap-2 border-t border-border p-2">
        {authSlot ?? (
          <NavLink
            to="/login"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Login
          </NavLink>
        )}
        <ThemeToggle />
      </div>
    </aside>
  )
}
