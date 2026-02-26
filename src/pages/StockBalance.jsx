import { Search, Download } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

const statusBadge = {
  ok: 'bg-green-50 text-green-700 border border-green-200',
  low: 'bg-amber-50 text-amber-700 border border-amber-200',
  critical: 'bg-red-50 text-red-700 border border-red-200',
}

const statusLabel = {
  ok: 'OK',
  low: 'Low',
  critical: 'Critical',
}

// Placeholder data — will be replaced with IPC calls in Phase 3
const sampleProducts = []

export default function StockBalance() {
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="w-full bg-sunken border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="Search products..."
          />
        </div>
        <button className="flex items-center gap-2 bg-surface hover:bg-sunken text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-border transition-colors duration-150">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stock table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sunken border-b border-border">
              <th className="text-left text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Product</th>
              <th className="text-left text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Category</th>
              <th className="text-right text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">In Stock</th>
              <th className="text-right text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Min Level</th>
              <th className="text-right text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Cost Value</th>
              <th className="text-right text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Retail Value</th>
              <th className="text-center text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sampleProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-secondary">
                  No products in stock yet. Add products from the Stock Input page.
                </td>
              </tr>
            ) : (
              sampleProducts.map((product) => {
                const status =
                  product.quantity === 0
                    ? 'critical'
                    : product.quantity < product.min_threshold
                    ? 'low'
                    : 'ok'
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors duration-100">
                    <td className="px-4 py-3 text-ink-primary font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-ink-secondary">{product.category}</td>
                    <td className="px-4 py-3 text-ink-primary text-right">{product.quantity}</td>
                    <td className="px-4 py-3 text-ink-secondary text-right">{product.min_threshold}</td>
                    <td className="px-4 py-3 text-ink-primary text-right">
                      {formatCurrency(product.cost_price * product.quantity)}
                    </td>
                    <td className="px-4 py-3 text-ink-primary text-right">
                      {formatCurrency(product.sale_price * product.quantity)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[status]}`}
                      >
                        {statusLabel[status]}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Footer totals */}
        {sampleProducts.length > 0 && (
          <div className="bg-sunken border-t border-border px-4 py-3 flex justify-end gap-8">
            <span className="text-xs font-medium text-ink-secondary">
              Total Cost Value:{' '}
              <span className="text-ink-primary font-semibold">
                {formatCurrency(sampleProducts.reduce((sum, p) => sum + p.cost_price * p.quantity, 0))}
              </span>
            </span>
            <span className="text-xs font-medium text-ink-secondary">
              Total Retail Value:{' '}
              <span className="text-ink-primary font-semibold">
                {formatCurrency(sampleProducts.reduce((sum, p) => sum + p.sale_price * p.quantity, 0))}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
