import { LogIn, LogOut } from 'lucide-react'
import { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'

import { SidebarCollapsedContext } from './sidebarCollapsedContext'
import { clearMockSession, isMockAuthenticated } from '@/auth/mockSession'
import { Button } from '@/components/ui/button'

const expandedLinkClassName =
  'text-muted-foreground hover:bg-muted hover:text-foreground flex h-auto items-center gap-3 rounded-md px-3 py-2 text-sm font-normal transition-colors'

const collapsedIconClassName =
  'text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors'

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
        className={collapsed ? collapsedIconClassName : expandedLinkClassName}
        size={collapsed ? 'icon-sm' : undefined}
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
        {!collapsed ? <span>Logout</span> : null}
      </Button>
    )
  }

  return (
    <NavLink
      aria-label={collapsed ? 'Login' : undefined}
      className={collapsed ? collapsedIconClassName : expandedLinkClassName}
      title={collapsed ? 'Login' : undefined}
      to="/login"
    >
      <LogIn aria-hidden className="size-5 shrink-0" />
      {!collapsed ? <span>Login</span> : null}
    </NavLink>
  )
}
