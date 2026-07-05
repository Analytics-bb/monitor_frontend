import type { ReactElement } from 'react'
import type { RouteObject } from 'react-router'
import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/app/layout/AppLayout'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { AgentSettingsPage } from '@/pages/AgentSettingsPage'
import { CabinetPage } from '@/pages/CabinetPage'
import { DeepChatPage } from '@/pages/DeepChatPage'
import { DeepListPage } from '@/pages/DeepListPage'
import { LoginPage } from '@/pages/LoginPage'
import { MonitoringPage } from '@/pages/MonitoringPage'
import { UsagePage } from '@/pages/UsagePage'
import { UsageRunDetailPage } from '@/pages/UsageRunDetailPage'
import { SupportPage } from '@/pages/SupportPage'

function guard(element: ReactElement) {
  return <ProtectedRoute>{element}</ProtectedRoute>
}

export const appRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: guard(<Navigate replace to="/monitoring" />),
      },
      { path: 'monitoring', element: guard(<MonitoringPage />) },
      { path: 'deep', element: guard(<DeepListPage />) },
      { path: 'deep/:auditId', element: guard(<DeepChatPage />) },
      { path: 'support', element: guard(<SupportPage />) },
      { path: 'usage', element: guard(<UsagePage />) },
      { path: 'usage/:runId', element: guard(<UsageRunDetailPage />) },
      {
        path: 'settings',
        element: guard(<Navigate replace to="/settings/agents" />),
      },
      { path: 'settings/agents', element: guard(<AgentSettingsPage />) },
      { path: 'cabinet', element: guard(<CabinetPage />) },
    ],
  },
]

/** Basename из Vite `base` (`import.meta.env.BASE_URL`); в prod/Docker — `/`. */
function getRouterBasename(): string | undefined {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '')
  return basename || undefined
}

export const router = createBrowserRouter(appRoutes, {
  basename: getRouterBasename(),
})
