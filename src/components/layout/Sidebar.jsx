import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  PackagePlus,
  PackageSearch,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

const managerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Stock Input', icon: PackagePlus, path: '/stock-input' },
  { label: 'Stock Balance', icon: PackageSearch, path: '/stock-balance' },
  { label: 'Sales', icon: ShoppingCart, path: '/sales' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Staff', icon: Users, path: '/staff' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

const cashierNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Stock Balance', icon: PackageSearch, path: '/stock-balance' },
  { label: 'Sales', icon: ShoppingCart, path: '/sales' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { staff, logout } = useAuthStore()

  const navItems = staff?.role === 'manager' ? managerNav : cashierNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-[220px] bg-slate-900 flex flex-col h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6">
        <h1 className="text-white text-lg font-bold tracking-tight">POISA POS</h1>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                text-sm font-medium transition-colors duration-150
                ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Staff info + logout */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-4 mt-2">
        <div className="px-3 mb-3">
          <p className="text-sm font-medium text-white truncate">{staff?.name}</p>
          <p className="text-xs text-slate-400 capitalize">{staff?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-150"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
