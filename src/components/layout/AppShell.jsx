import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/stock-input': 'Stock Input',
  '/stock-balance': 'Stock Balance',
  '/sales': 'Sales',
  '/reports': 'Weekly Reports',
  '/staff': 'Staff Management',
  '/settings': 'Settings',
}

export default function AppShell() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'POISA POS'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto bg-canvas p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
