import { X, Printer } from 'lucide-react'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function Receipt({ sale, shopName, staffName, onClose }) {
  const handlePrint = () => {
    window.print()
  }

  if (!sale) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm">
        {/* Modal header (hidden on print) */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 print:hidden">
          <h2 className="text-lg font-semibold text-ink-primary">Receipt</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-ink-secondary hover:bg-sunken hover:text-ink-primary transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        {/* Receipt content */}
        <div id="receipt-content" className="px-6 pb-6 text-sm">
          {/* Shop header */}
          <div className="text-center border-b border-dashed border-border pb-3 mb-3">
            <p className="font-bold text-ink-primary">{shopName || 'POISA Retail Store'}</p>
            <p className="text-xs text-ink-secondary mt-1">{formatDateTime(sale.created_at)}</p>
            <p className="text-xs text-ink-secondary">Served by: {staffName}</p>
            <p className="text-xs text-ink-muted mt-1">Sale #{sale.id}</p>
          </div>

          {/* Line items */}
          <div className="border-b border-dashed border-border pb-3 mb-3 space-y-1.5">
            {sale.items?.map((item, i) => (
              <div key={i} className="flex justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-ink-primary truncate">{item.product_name}</p>
                  <p className="text-xs text-ink-muted">
                    {item.quantity} x {formatCurrency(item.unit_price)}
                    {item.discount > 0 && ` (-${formatCurrency(item.discount)})`}
                  </p>
                </div>
                <span className="text-ink-primary font-medium whitespace-nowrap">
                  {formatCurrency(item.line_total)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 border-b border-dashed border-border pb-3 mb-3">
            <div className="flex justify-between">
              <span className="text-ink-secondary">Subtotal</span>
              <span className="text-ink-primary">{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-secondary">Discount</span>
                <span className="text-danger">-{formatCurrency(sale.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1">
              <span className="text-ink-primary">Total</span>
              <span className="text-ink-primary">{formatCurrency(sale.total)}</span>
            </div>
          </div>

          {/* Payment info */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-secondary">Payment</span>
              <span className="text-ink-primary capitalize">{sale.payment_method}</span>
            </div>
            {sale.cash_tendered > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Cash Tendered</span>
                  <span className="text-ink-primary">{formatCurrency(sale.cash_tendered)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Change</span>
                  <span className="text-ink-primary">{formatCurrency(sale.change_given)}</span>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-xs text-ink-muted mt-4">Thank you for your purchase!</p>
        </div>

        {/* Actions (hidden on print) */}
        <div className="flex gap-3 px-6 pb-5 print:hidden">
          <button onClick={onClose} className="flex-1 bg-surface hover:bg-sunken text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg border border-border transition-colors duration-150">
            Close
          </button>
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors duration-150">
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>
    </div>
  )
}
