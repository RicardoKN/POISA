import { useState, useEffect, useMemo } from 'react'
import { Search, Download, ArrowUpDown, Filter, Loader2 } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

const statusBadge = {
  ok: 'bg-green-50 text-green-700 border border-green-200',
  low: 'bg-amber-50 text-amber-700 border border-amber-200',
  critical: 'bg-red-50 text-red-700 border border-red-200',
}

const statusLabel = { ok: 'OK', low: 'Low', critical: 'Critical' }

function getStatus(product) {
  if (product.quantity === 0) return 'critical'
  if (product.quantity < product.min_threshold) return 'low'
  return 'ok'
}

export default function StockBalance() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const api = window.electronAPI
      if (api) {
        const result = await api.getStockBalance()
        if (result.success) setProducts(result.data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  // Unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))]
    return cats.sort()
  }, [products])

  // Filter + sort
  const displayed = useMemo(() => {
    let result = [...products]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      )
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter)
    }

    // Sort
    result.sort((a, b) => {
      let valA, valB
      switch (sortField) {
        case 'name':
          valA = a.name.toLowerCase()
          valB = b.name.toLowerCase()
          return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
        case 'quantity':
          valA = a.quantity
          valB = b.quantity
          break
        case 'cost_value':
          valA = a.cost_price * a.quantity
          valB = b.cost_price * b.quantity
          break
        case 'retail_value':
          valA = a.sale_price * a.quantity
          valB = b.sale_price * b.quantity
          break
        case 'status':
          const order = { critical: 0, low: 1, ok: 2 }
          valA = order[getStatus(a)]
          valB = order[getStatus(b)]
          break
        default:
          return 0
      }
      return sortDir === 'asc' ? valA - valB : valB - valA
    })

    return result
  }, [products, searchQuery, categoryFilter, sortField, sortDir])

  // Totals
  const totalCost = displayed.reduce((sum, p) => sum + p.cost_price * p.quantity, 0)
  const totalRetail = displayed.reduce((sum, p) => sum + p.sale_price * p.quantity, 0)

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const exportCSV = () => {
    const headers = ['Product', 'Category', 'In Stock', 'Min Level', 'Cost Price', 'Sale Price', 'Cost Value', 'Retail Value', 'Status']
    const rows = displayed.map((p) => [
      p.name,
      p.category || '',
      p.quantity,
      p.min_threshold,
      p.cost_price.toFixed(2),
      p.sale_price.toFixed(2),
      (p.cost_price * p.quantity).toFixed(2),
      (p.sale_price * p.quantity).toFixed(2),
      statusLabel[getStatus(p)],
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-balance-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortableHeader = ({ label, field, align = 'left' }) => (
    <th
      className={`text-${align} text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3 cursor-pointer select-none hover:text-ink-primary transition-colors duration-100`}
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} className={sortField === field ? 'text-ink-primary' : 'text-ink-muted'} />
      </span>
    </th>
  )

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-sunken border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
              placeholder="Search products..."
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button
          onClick={exportCSV}
          disabled={displayed.length === 0}
          className="flex items-center gap-2 bg-surface hover:bg-sunken disabled:opacity-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-border transition-colors duration-150"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stock table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sunken border-b border-border">
              <SortableHeader label="Product" field="name" />
              <th className="text-left text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Category</th>
              <SortableHeader label="In Stock" field="quantity" align="right" />
              <th className="text-right text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Min Level</th>
              <SortableHeader label="Cost Value" field="cost_value" align="right" />
              <SortableHeader label="Retail Value" field="retail_value" align="right" />
              <SortableHeader label="Status" field="status" align="center" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Loader2 size={20} className="animate-spin mx-auto text-ink-muted" />
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-secondary">
                  {products.length === 0
                    ? 'No products in stock yet. Add products from the Stock Input page.'
                    : 'No products match your search.'}
                </td>
              </tr>
            ) : (
              displayed.map((product) => {
                const status = getStatus(product)
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
        {displayed.length > 0 && (
          <div className="bg-sunken border-t border-border px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-ink-muted">
              {displayed.length} product{displayed.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-8">
              <span className="text-xs font-medium text-ink-secondary">
                Total Cost Value:{' '}
                <span className="text-ink-primary font-semibold">{formatCurrency(totalCost)}</span>
              </span>
              <span className="text-xs font-medium text-ink-secondary">
                Total Retail Value:{' '}
                <span className="text-ink-primary font-semibold">{formatCurrency(totalRetail)}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
