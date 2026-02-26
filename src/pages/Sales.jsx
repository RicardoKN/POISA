import { Search, Plus, Minus, Trash2 } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

export default function Sales() {
  // TODO: Wire up with salesStore + IPC in Phase 4

  return (
    <div className="flex gap-6 h-[calc(100vh-56px-48px)]">
      {/* Left panel — product search & grid */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="w-full bg-sunken border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="Search products by name or barcode..."
          />
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
            {/* Empty state */}
            <div className="col-span-full flex items-center justify-center py-20">
              <p className="text-sm text-ink-secondary">No products to display. Add products from Stock Input.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — cart */}
      <div className="w-[360px] bg-surface rounded-xl border border-border shadow-sm flex flex-col flex-shrink-0">
        {/* Cart header */}
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-ink-primary">Current Sale</h3>
          <p className="text-xs text-ink-muted mt-0.5">0 items</p>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <p className="text-sm text-ink-secondary text-center py-12">Cart is empty</p>
        </div>

        {/* Cart footer */}
        <div className="border-t border-border p-5 space-y-4">
          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">Subtotal</span>
              <span className="text-ink-primary font-medium">{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">Discount</span>
              <span className="text-ink-primary font-medium">-{formatCurrency(0)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <span className="text-base font-semibold text-ink-primary">Total</span>
              <span className="text-3xl font-bold text-ink-primary">{formatCurrency(0)}</span>
            </div>
          </div>

          {/* Complete sale button */}
          <button
            disabled
            className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base font-semibold py-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  )
}
