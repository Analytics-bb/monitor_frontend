import { NavLink } from 'react-router'

const navItems = [
  { to: '/monitoring', label: 'Мониторинг' },
  { to: '/deep', label: 'Deep' },
  { to: '/usage', label: 'Usage' },
  { to: '/settings', label: 'Настройки' },
  { to: '/cabinet', label: 'Кабинет' },
] as const

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">BB Anomaly</p>
        <p className="text-xs text-muted-foreground">Monitor</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
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
    </aside>
  )
}
