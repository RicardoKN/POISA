import { useState } from 'react'
import { X, CreditCard, Banknote, Split } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

export default function PaymentModal({ total, onConfirm, onClose }) {
  const [method, setMethod] = useState('cash')
  const [cashTendered, setCashTendered] = useState('')
  const [cardAmount, setCardAmount] = useState('')
  const [cashAmount, setCashAmount] = useState('')

  const cashValue = parseFloat(cashTendered) || 0
  const change = method === 'cash' ? Math.max(0, cashValue - total) : 0
  const canConfirmCash = method === 'cash' && cashValue >= total
  const canConfirmCard = method === 'card'
  const mixedCash = parseFloat(cashAmount) || 0
  const mixedCard = parseFloat(cardAmount) || 0
  const canConfirmMixed = method === 'mixed' && (mixedCash + mixedCard) >= total

  const canConfirm = canConfirmCash || canConfirmCard || canConfirmMixed

  const handleConfirm = () => {
    if (!canConfirm) return

    let paymentData = { payment_method: method }

    if (method === 'cash') {
      paymentData.cash_tendered = cashValue
      paymentData.change_given = change
    } else if (method === 'mixed') {
      paymentData.cash_tendered = mixedCash
      paymentData.change_given = Math.max(0, (mixedCash + mixedCard) - total)
    }

    onConfirm(paymentData)
  }

  const quickCash = [50, 100, 200, 500]

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-ink-primary">Payment</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-ink-secondary hover:bg-sunken hover:text-ink-primary transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        {/* Total */}
        <div className="text-center bg-sunken rounded-xl p-4 mb-5">
          <p className="text-xs text-ink-secondary uppercase tracking-wide font-medium">Amount Due</p>
          <p className="text-3xl font-bold text-ink-primary mt-1">{formatCurrency(total)}</p>
        </div>

        {/* Method tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { key: 'cash', label: 'Cash', icon: Banknote },
            { key: 'card', label: 'Card', icon: CreditCard },
            { key: 'mixed', label: 'Split', icon: Split },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMethod(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                method === key
                  ? 'bg-slate-800 text-white'
                  : 'bg-sunken text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Cash fields */}
        {method === 'cash' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink-primary">Cash Tendered (BWP)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              {quickCash.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCashTendered(String(amt))}
                  className="flex-1 bg-sunken hover:bg-slate-200 text-sm font-medium text-ink-primary py-2 rounded-lg transition-colors duration-150"
                >
                  {amt}
                </button>
              ))}
            </div>
            {cashValue >= total && (
              <div className="flex justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <span className="text-sm font-medium text-green-700">Change</span>
                <span className="text-sm font-bold text-green-700">{formatCurrency(change)}</span>
              </div>
            )}
          </div>
        )}

        {/* Card — no extra fields needed */}
        {method === 'card' && (
          <div className="bg-sunken rounded-lg p-4 text-center">
            <p className="text-sm text-ink-secondary">Process card payment on terminal, then confirm below.</p>
          </div>
        )}

        {/* Mixed payment */}
        {method === 'mixed' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink-primary">Cash Amount (BWP)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink-primary">Card Amount (BWP)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">Combined</span>
              <span className={`font-medium ${(mixedCash + mixedCard) >= total ? 'text-green-700' : 'text-danger'}`}>
                {formatCurrency(mixedCash + mixedCard)} / {formatCurrency(total)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-surface hover:bg-sunken text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg border border-border transition-colors duration-150">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors duration-150"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  )
}
