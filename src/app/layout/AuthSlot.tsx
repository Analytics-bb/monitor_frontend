import { LogIn, LogOut } from 'lucide-react'
import { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'

import { SidebarCollapsedContext } from './sidebarCollapsedContext'
import { clearMockSession, isMockAuthenticated } from '@/auth/mockSession'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const linkClassName = (collapsed: boolean) =>
  cn(
    'text-muted-foreground hover:bg-muted hover:text-foreground flex items-center rounded-md py-2 text-sm transition-colors',
    collapsed ? 'justify-center px-2' : 'gap-3 px-3',
  )

const labelClassName = (collapsed: boolean) =>
  cn(
    'truncate whitespace-nowrap transition-all duration-300',
    collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
  )

/**
 * Слот Login/Logout в sidebar: один элемент по состоянию mock-сессии.
 */
export function AuthSlot() {
  const collapsed = useContext(SidebarCollapsedContext)
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(() => isMockAuthenticated())

  if (authed) {
    return (
      <Button
        aria-label={collapsed ? 'Logout' : undefined}
        className={cn(linkClassName(collapsed), 'h-auto font-normal')}
        title={collapsed ? 'Logout' : undefined}
        type="button"
        variant="ghost"
        onClick={() => {
          clearMockSession()
          setAuthed(false)
          navigate('/login')
        }}
      >
        <LogOut aria-hidden className="size-5 shrink-0" />
        <span aria-hidden={collapsed} className={labelClassName(collapsed)}>
          Logout
        </span>
      </Button>
    )
  }

  return (
    <NavLink
      aria-label={collapsed ? 'Login' : undefined}
      className={linkClassName(collapsed)}
      title={collapsed ? 'Login' : undefined}
      to="/login"
    >
      <LogIn aria-hidden className="size-5 shrink-0" />
      <span aria-hidden={collapsed} className={labelClassName(collapsed)}>
        Login
      </span>
    </NavLink>
  )
}
