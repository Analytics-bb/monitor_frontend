import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/app/layout/AppLayout'
import { AgentSettingsPage } from '@/pages/AgentSettingsPage'
import { CabinetPage } from '@/pages/CabinetPage'
import { DeepChatPage } from '@/pages/DeepChatPage'
import { DeepListPage } from '@/pages/DeepListPage'
import { LoginPage } from '@/pages/LoginPage'
import { MonitoringPage } from '@/pages/MonitoringPage'
import { UsagePage } from '@/pages/UsagePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/monitoring" replace /> },
      { path: 'monitoring', element: <MonitoringPage /> },
      { path: 'deep', element: <DeepListPage /> },
      { path: 'deep/:auditId', element: <DeepChatPage /> },
      { path: 'usage', element: <UsagePage /> },
      {
        path: 'settings',
        element: <Navigate to="/settings/agents" replace />,
      },
      { path: 'settings/agents', element: <AgentSettingsPage /> },
      { path: 'cabinet', element: <CabinetPage /> },
    ],
  },
])
