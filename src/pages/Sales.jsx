import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Search, Plus, Minus, Trash2, Percent, History } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import PaymentModal from '../components/sales/PaymentModal'
import Receipt from '../components/sales/Receipt'

export default function Sales() {
  const { staff } = useAuthStore()
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [cartDiscount, setCartDiscount] = useState({ type: 'fixed', value: '' })
  const [showPayment, setShowPayment] = useState(false)
  const [completedSale, setCompletedSale] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [todaySales, setTodaySales] = useState([])
  const [processing, setProcessing] = useState(false)
  const [shopName, setShopName] = useState('POISA Retail Store')
  const searchRef = useRef(null)
  const productGridRef = useRef(null)

  useEffect(() => {
    loadProducts()
    // Load shop name from settings
    const loadShopName = async () => {
      try {
        const api = window.electronAPI
        if (api) {
          const result = await api.getSetting('shop_name')
          if (result.success && result.data) setShopName(result.data)
        }
      } catch { /* ignore */ }
    }
    loadShopName()
  }, [])

  // ── Keyboard navigation ───────────────────────────────
  const handleKeyDown = useCallback((e) => {
    // Don't intercept when modals are open or inside discount/payment inputs
    if (showPayment || completedSale || showHistory) return

    // F1 → focus search
    if (e.key === 'F1') {
      e.preventDefault()
      searchRef.current?.focus()
      return
    }

    // F2 → open payment if cart has items
    if (e.key === 'F2' && cart.length > 0 && !processing) {
      e.preventDefault()
      setShowPayment(true)
      return
    }

    // Escape → clear search or deselect
    if (e.key === 'Escape') {
      if (searchQuery) {
        setSearchQuery('')
        searchRef.current?.blur()
      }
      return
    }
  }, [showPayment, completedSale, showHistory, cart.length, processing, searchQuery])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // ── Barcode scanner support ───────────────────────────
  // Rapid key input (within 50ms between chars) detected as scanner
  const barcodeBuffer = useRef('')
  const barcodeTimer = useRef(null)

  useEffect(() => {
    const handleBarcodeInput = (e) => {
      if (showPayment || completedSale || showHistory) return
      // Only capture when no text input is focused (except search)
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.target !== searchRef.current) return
      }

      if (e.key === 'Enter' && barcodeBuffer.current.length >= 3) {
        const barcode = barcodeBuffer.current
        barcodeBuffer.current = ''
        clearTimeout(barcodeTimer.current)
        // Find product by barcode
        const product = products.find((p) => p.barcode === barcode && p.quantity > 0)
        if (product) {
          addToCart(product)
        } else {
          toast.error(`No product found for barcode: ${barcode}`)
        }
        // Clear search if it captured the barcode
        if (document.activeElement === searchRef.current) {
          setSearchQuery('')
        }
        return
      }

      if (e.key.length === 1) {
        barcodeBuffer.current += e.key
        clearTimeout(barcodeTimer.current)
        barcodeTimer.current = setTimeout(() => {
          barcodeBuffer.current = ''
        }, 100)
      }
    }

    window.addEventListener('keydown', handleBarcodeInput)
    return () => {
      window.removeEventListener('keydown', handleBarcodeInput)
      clearTimeout(barcodeTimer.current)
    }
  }, [products, showPayment, completedSale, showHistory])

  const loadProducts = async () => {
    try {
      const api = window.electronAPI
      if (api) {
        const result = await api.getProducts()
        if (result.success) setProducts(result.data)
      }
    } catch { /* ignore */ }
  }

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.filter((p) => p.quantity > 0)
    const q = searchQuery.toLowerCase()
    return products.filter(
      (p) =>
        (p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q))) &&
        p.quantity > 0
    )
  }, [products, searchQuery])

  // ── Cart logic ──────────────────────────────────────────

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id)
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error('Not enough stock')
          return prev
        }
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, line_total: (item.quantity + 1) * item.unit_price - item.discount }
            : item
        )
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          unit_price: product.sale_price,
          quantity: 1,
          max_quantity: product.quantity,
          discount: 0,
          line_total: product.sale_price,
        },
      ]
    })
  }

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id !== productId) return item
          const newQty = item.quantity + delta
          if (newQty <= 0) return null
          if (newQty > item.max_quantity) {
            toast.error('Not enough stock')
            return item
          }
          return { ...item, quantity: newQty, line_total: newQty * item.unit_price - item.discount }
        })
        .filter(Boolean)
    )
  }

  const updateItemDiscount = (productId, discountValue) => {
    const val = parseFloat(discountValue) || 0
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, discount: val, line_total: item.quantity * item.unit_price - val }
          : item
      )
    )
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId))
  }

  // ── Totals ──────────────────────────────────────────────

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0)
  const cartDiscountAmount = useMemo(() => {
    const val = parseFloat(cartDiscount.value) || 0
    if (cartDiscount.type === 'percent') return ((subtotal - itemDiscounts) * val) / 100
    return val
  }, [cartDiscount, subtotal, itemDiscounts])
  const total = Math.max(0, subtotal - itemDiscounts - cartDiscountAmount)

  // ── Payment ─────────────────────────────────────────────

  const handlePayment = async (paymentData) => {
    setProcessing(true)
    try {
      const saleData = {
        subtotal,
        discount_amount: itemDiscounts + cartDiscountAmount,
        total,
        ...paymentData,
        staff_id: staff?.id,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount,
          line_total: item.line_total,
        })),
      }

      const api = window.electronAPI
      if (api) {
        const result = await api.createSale(saleData)
        if (result.success) {
          toast.success('Sale completed!')
          setCompletedSale({ ...result.data, staff_name: staff?.name })
          setCart([])
          setCartDiscount({ type: 'fixed', value: '' })
          setShowPayment(false)
          loadProducts() // refresh stock quantities
        } else {
          toast.error(result.error)
        }
      } else {
        toast.success('Sale completed (dev mode)')
        setCart([])
        setCartDiscount({ type: 'fixed', value: '' })
        setShowPayment(false)
      }
    } catch (err) {
      toast.error('Failed to process sale')
    } finally {
      setProcessing(false)
    }
  }

  // ── Sale history ────────────────────────────────────────

  const loadTodaySales = async () => {
    try {
      const api = window.electronAPI
      if (api) {
        const today = new Date().toISOString().split('T')[0]
        const result = await api.getSales({ date: today })
        if (result.success) setTodaySales(result.data)
      }
    } catch { /* ignore */ }
    setShowHistory(true)
  }

  return (
    <>
      <div className="flex gap-6 h-[calc(100vh-56px-48px)]">
        {/* Left panel — product search & grid */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search + history */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-sunken border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
                placeholder="Search products (F1) &middot; Scan barcode..."
              />
            </div>
            <button
              onClick={loadTodaySales}
              className="flex items-center gap-2 bg-surface hover:bg-sunken text-slate-700 text-sm font-medium px-3 py-2 rounded-lg border border-border transition-colors duration-150"
            >
              <History size={16} />
            </button>
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-ink-secondary">
                  {products.length === 0
                    ? 'No products available. Add products from Stock Input.'
                    : 'No products match your search.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="rounded-xl bg-sunken hover:bg-slate-100 hover:shadow-sm p-4 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <p className="text-sm font-medium text-ink-primary truncate">{product.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{product.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-ink-primary">{formatCurrency(product.sale_price)}</span>
                      <span className="text-xs text-ink-muted">{product.quantity} left</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — cart */}
        <div className="w-[380px] bg-surface rounded-xl border border-border shadow-sm flex flex-col flex-shrink-0">
          {/* Cart header */}
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-ink-primary">Current Sale</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-ink-secondary text-center py-12">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="py-3 border-b border-border last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-medium text-ink-primary truncate">{item.product_name}</p>
                      <p className="text-xs text-ink-muted">{formatCurrency(item.unit_price)} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="p-1 rounded text-ink-muted hover:text-danger hover:bg-red-50 transition-colors duration-150"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-sunken text-ink-secondary hover:bg-slate-200 transition-colors duration-150"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-ink-primary">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-sunken text-ink-secondary hover:bg-slate-200 transition-colors duration-150"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-ink-primary">{formatCurrency(item.line_total)}</span>
                  </div>
                  {/* Item discount */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-ink-muted">Disc BWP</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.discount || ''}
                      onChange={(e) => updateItemDiscount(item.product_id, e.target.value)}
                      className="w-20 bg-sunken border border-border rounded px-2 py-1 text-xs text-ink-primary focus:outline-none focus:ring-1 focus:ring-slate-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart footer */}
          <div className="border-t border-border p-5 space-y-4">
            {/* Cart-level discount */}
            {cart.length > 0 && (
              <div className="flex items-center gap-2">
                <Percent size={14} className="text-ink-muted flex-shrink-0" />
                <select
                  value={cartDiscount.type}
                  onChange={(e) => setCartDiscount((prev) => ({ ...prev, type: e.target.value }))}
                  className="bg-sunken border border-border rounded px-2 py-1 text-xs text-ink-primary focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="fixed">BWP</option>
                  <option value="percent">%</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cartDiscount.value}
                  onChange={(e) => setCartDiscount((prev) => ({ ...prev, value: e.target.value }))}
                  className="flex-1 bg-sunken border border-border rounded px-2 py-1 text-xs text-ink-primary focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Cart discount"
                />
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-secondary">Subtotal</span>
                <span className="text-ink-primary font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {(itemDiscounts + cartDiscountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-secondary">Discount</span>
                  <span className="text-danger font-medium">-{formatCurrency(itemDiscounts + cartDiscountAmount)}</span>
                </div>
              )}
              <div className="h-px bg-border" />
              <div className="flex justify-between items-baseline">
                <span className="text-base font-semibold text-ink-primary">Total</span>
                <span className="text-3xl font-bold text-ink-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Complete sale button */}
            <button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0 || processing}
              className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base font-semibold py-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              {processing ? 'Processing...' : 'Complete Sale (F2)'}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPayment && (
        <PaymentModal
          total={total}
          onConfirm={handlePayment}
          onClose={() => setShowPayment(false)}
        />
      )}

      {completedSale && (
        <Receipt
          sale={completedSale}
          shopName={shopName}
          staffName={staff?.name}
          onClose={() => setCompletedSale(null)}
        />
      )}

      {/* Today's sales history drawer */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-ink-primary">Today's Sales</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 rounded-lg text-ink-secondary hover:bg-sunken hover:text-ink-primary transition-colors duration-150">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-3">
              {todaySales.length === 0 ? (
                <p className="text-sm text-ink-secondary text-center py-8">No sales today.</p>
              ) : (
                <div className="space-y-2">
                  {todaySales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between py-3 px-3 rounded-lg bg-sunken">
                      <div>
                        <p className="text-sm font-medium text-ink-primary">Sale #{sale.id}</p>
                        <p className="text-xs text-ink-muted">{formatDateTime(sale.created_at)} — {sale.staff_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink-primary">{formatCurrency(sale.total)}</p>
                        <p className="text-xs text-ink-muted capitalize">{sale.payment_method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
