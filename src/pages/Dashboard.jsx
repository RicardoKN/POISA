import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

const kpiCards = [
  {
    label: "Today's Revenue",
    value: formatCurrency(0),
    change: null,
    icon: DollarSign,
  },
  {
    label: "Today's Transactions",
    value: '0',
    change: null,
    icon: ShoppingCart,
  },
  {
    label: 'Avg Sale Value',
    value: formatCurrency(0),
    change: null,
    icon: TrendingUp,
  },
  {
    label: 'Total Products',
    value: '0',
    change: null,
    icon: Package,
  },
]

export default function Dashboard() {
  // TODO: fetch live data via IPC in Phase 3

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
              <p className="text-2xl font-bold text-ink-primary">{card.value}</p>
              {card.change && (
                <p className="text-xs text-ink-muted mt-1">{card.change}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Low stock alerts placeholder */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-warning" />
          <h3 className="text-sm font-semibold text-ink-primary">Low Stock Alerts</h3>
        </div>
        <p className="text-sm text-ink-secondary">No low stock items to display.</p>
      </div>
    </div>
  )
}
