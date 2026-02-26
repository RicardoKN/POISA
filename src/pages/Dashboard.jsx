import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

const statusBadge = {
  critical: 'bg-red-50 text-red-700 border border-red-200',
  low: 'bg-amber-50 text-amber-700 border border-amber-200',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const api = window.electronAPI
      if (api) {
        const result = await api.getDashboardStats()
        if (result.success) setStats(result.data)
      } else {
        // Dev fallback
        setStats({
          todayRevenue: 0,
          todayTransactions: 0,
          avgSaleValue: 0,
          totalProducts: 15,
          lowStockItems: [],
        })
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const kpiCards = [
    {
      label: "Today's Revenue",
      value: formatCurrency(stats?.todayRevenue || 0),
      icon: DollarSign,
    },
    {
      label: "Today's Transactions",
      value: String(stats?.todayTransactions || 0),
      icon: ShoppingCart,
    },
    {
      label: 'Avg Sale Value',
      value: formatCurrency(stats?.avgSaleValue || 0),
      icon: TrendingUp,
    },
    {
      label: 'Total Products',
      value: String(stats?.totalProducts || 0),
      icon: Package,
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-surface rounded-xl border border-border p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-ink-secondary uppercase tracking-wide">
                  {card.label}
                </p>
                <Icon size={16} className="text-ink-muted" />
              </div>
              <p className="text-2xl font-bold text-ink-primary">
                {loading ? '—' : card.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Low stock alerts */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-warning" />
          <h3 className="text-sm font-semibold text-ink-primary">Low Stock Alerts</h3>
          {stats?.lowStockItems?.length > 0 && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
              {stats.lowStockItems.length}
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-ink-secondary">Loading...</p>
        ) : !stats?.lowStockItems?.length ? (
          <p className="text-sm text-ink-secondary">All products are well stocked.</p>
        ) : (
          <div className="space-y-2">
            {stats.lowStockItems.map((item) => {
              const isCritical = item.quantity === 0
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-sunken"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-primary">{item.name}</p>
                    <p className="text-xs text-ink-muted">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-ink-primary font-medium">
                      {item.quantity} / {item.min_threshold}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        statusBadge[isCritical ? 'critical' : 'low']
                      }`}
                    >
                      {isCritical ? 'Out of Stock' : 'Low'}
                    </span>
                  </div>
                </div>
              )
            })}
            <button
              onClick={() => navigate('/stock-balance')}
              className="text-xs text-slate-600 hover:text-slate-800 font-medium mt-2 transition-colors duration-150"
            >
              View all stock →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
