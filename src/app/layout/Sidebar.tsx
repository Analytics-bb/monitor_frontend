import {
  Activity,
  ListChecks,
  LogIn,
  PanelLeftClose,
  PanelRightOpen,
  PieChart,
  Settings,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router'

import { ThemeToggle } from './ThemeToggle'
import {
  getStoredSidebarCollapsed,
  storeSidebarCollapsed,
} from './sidebarStorage'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems: ReadonlyArray<{
  to: string
  label: string
  icon: LucideIcon
}> = [
  { to: '/monitoring', label: 'Мониторинг', icon: Activity },
  { to: '/deep', label: 'Аналитика срабатываний', icon: ListChecks },
  { to: '/usage', label: 'Использование', icon: PieChart },
  { to: '/settings/agents', label: 'Настройки', icon: Settings },
  { to: '/cabinet', label: 'Кабинет', icon: UserRound },
] as const

export interface SidebarProps {
  /** Слот Login/Logout; реализация session — module-6. */
  authSlot?: ReactNode
}

/**
 * Боковая навигация M17 с анимированным сворачиванием, theme toggle и auth slot.
 */
export function Sidebar({ authSlot }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(getStoredSidebarCollapsed)

  useEffect(() => {
    storeSidebarCollapsed(collapsed)
  }, [collapsed])

  return (
    <aside
      data-testid="sidebar"
      data-collapsed={collapsed ? 'true' : 'false'}
      className={cn(
        'border-border bg-card flex shrink-0 flex-col overflow-hidden border-r transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      <div
        className={cn(
          'border-border flex items-center border-b py-3',
          collapsed ? 'justify-center px-2' : 'justify-between px-3',
        )}
      >
        <div
          className={cn(
            'min-w-0 overflow-hidden transition-all duration-300',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
          )}
          aria-hidden={collapsed}
        >
          <p className="text-foreground truncate text-sm font-semibold">
            BB Anomaly
          </p>
          <p className="text-muted-foreground truncate text-xs">Monitor</p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          aria-controls="sidebar-navigation"
          aria-label={
            collapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель'
          }
        >
          {collapsed ? (
            <PanelRightOpen className="size-5" aria-hidden />
          ) : (
            <PanelLeftClose className="size-5" aria-hidden />
          )}
        </Button>
      </div>

      <nav
        id="sidebar-navigation"
        className="flex flex-1 flex-col gap-1 p-2"
        aria-label="Основная навигация"
      >
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-md py-2 text-sm transition-colors',
                  collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span
                className={cn(
                  'truncate whitespace-nowrap transition-all duration-300',
                  collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                )}
                aria-hidden={collapsed}
              >
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div
        className={cn(
          'border-border flex border-t p-2',
          collapsed
            ? 'flex-col items-center gap-2'
            : 'items-center justify-between gap-2',
        )}
      >
        {authSlot ?? (
          <NavLink
            to="/login"
            title={collapsed ? 'Login' : undefined}
            aria-label={collapsed ? 'Login' : undefined}
            className={cn(
              'text-muted-foreground hover:bg-muted hover:text-foreground flex items-center rounded-md py-2 text-sm transition-colors',
              collapsed ? 'justify-center px-2' : 'gap-3 px-3',
            )}
          >
            <LogIn className="size-5 shrink-0" aria-hidden />
            <span
              className={cn(
                'truncate whitespace-nowrap transition-all duration-300',
                collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
              )}
              aria-hidden={collapsed}
            >
              Login
            </span>
          </NavLink>
        )}
        <ThemeToggle />
      </div>
    </aside>
  )
}
